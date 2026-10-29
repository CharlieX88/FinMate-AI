import Watchlist from '../models/Watchlist.js';
import Loan from '../models/Loan.js';
import { calculateEMI } from '../utils/emiCalculator.js';

// @desc    Add loan to watchlist
// @route   POST /api/watchlist
// @access  Private
export const addToWatchlist = async (req, res, next) => {
  try {
    const { loanId, note, plannedAmount, plannedTenure } = req.body;

    if (!loanId) {
      return res.status(400).json({ success: false, message: 'loanId is required' });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    const item = await Watchlist.create({
      user: req.user._id,
      loan: loanId,
      note: note || '',
      plannedAmount: Number(plannedAmount) || 0,
      plannedTenure: Number(plannedTenure) || 0,
    });

    const populated = await item.populate('loan');

    res.status(201).json({ success: true, item: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Private
export const getWatchlist = async (req, res, next) => {
  try {
    const items = await Watchlist.find({ user: req.user._id })
      .populate('loan')
      .sort({ createdAt: -1 });

    // Har item ke saath EMI preview (agar plannedAmount + plannedTenure diye hain)
    const enriched = items.map((item) => {
      const obj = item.toObject();
      if (obj.loan && obj.plannedAmount > 0 && obj.plannedTenure > 0) {
        obj.previewEMI = calculateEMI(
          obj.plannedAmount,
          obj.loan.interestRate,
          obj.plannedTenure
        );
      }
      return obj;
    });

    res.status(200).json({ success: true, count: enriched.length, items: enriched });
  } catch (error) {
    next(error);
  }
};

// @desc    Update watchlist item (note, planned amount, tenure)
// @route   PUT /api/watchlist/:id
// @access  Private
export const updateWatchlistItem = async (req, res, next) => {
  try {
    const { note, plannedAmount, plannedTenure } = req.body;

    const item = await Watchlist.findOne({ _id: req.params.id, user: req.user._id });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Watchlist item not found' });
    }

    if (note !== undefined) item.note = note;
    if (plannedAmount !== undefined) item.plannedAmount = Number(plannedAmount);
    if (plannedTenure !== undefined) item.plannedTenure = Number(plannedTenure);

    await item.save();
    await item.populate('loan');

    res.status(200).json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove from watchlist
// @route   DELETE /api/watchlist/:id
// @access  Private
export const removeFromWatchlist = async (req, res, next) => {
  try {
    const item = await Watchlist.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Watchlist item not found' });
    }

    res.status(200).json({ success: true, message: 'Removed from watchlist' });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare 2-3 watchlist loans side-by-side
// @route   POST /api/watchlist/compare
// @access  Private
export const compareLoans = async (req, res, next) => {
  try {
    const { ids } = req.body; // array of watchlist IDs
    if (!Array.isArray(ids) || ids.length < 2 || ids.length > 3) {
      return res
        .status(400)
        .json({ success: false, message: 'Provide 2 or 3 watchlist IDs to compare' });
    }

    const items = await Watchlist.find({
      _id: { $in: ids },
      user: req.user._id,
    }).populate('loan');

    const compared = items.map((item) => {
      const loan = item.loan;
      const amount = item.plannedAmount || loan.maxAmount;
      const tenure = item.plannedTenure || loan.minTenure;
      const emi = calculateEMI(amount, loan.interestRate, tenure);

      return {
        watchlistId: item._id,
        bankName: loan.bankName,
        loanType: loan.loanType,
        interestRate: loan.interestRate,
        amount,
        tenure,
        emi,
        totalPayable: Math.round(emi * tenure * 100) / 100,
        totalInterest: Math.round((emi * tenure - amount) * 100) / 100,
        processingFeePercent: loan.processingFeePercent,
        features: loan.features,
      };
    });

    // Best EMI wala highlight
    const best = compared.reduce((a, b) => (a.emi < b.emi ? a : b), compared[0]);

    res.status(200).json({ success: true, compared, best: best.watchlistId });
  } catch (error) {
    next(error);
  }
};