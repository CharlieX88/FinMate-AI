import Loan from '../models/Loan.js';
import {
  getLoanSummary,
  checkAffordability,
  generateAmortizationSchedule,
} from '../utils/emiCalculator.js';
import { getTopRecommendations } from '../utils/loanRecommender.js';

// @desc    Get all loans (with filters: bankName, loanType, minRate, maxRate)
// @route   GET /api/loans
// @access  Public
export const getLoans = async (req, res, next) => {
  try {
    const { loanType, bankName, minRate, maxRate, minAmount, maxAmount, search } = req.query;

    const query = { isActive: true };

    if (loanType) query.loanType = loanType.toLowerCase();
    if (bankName) query.bankName = { $regex: bankName, $options: 'i' };
    if (search) {
      query.$or = [
        { bankName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (minRate || maxRate) {
      query.interestRate = {};
      if (minRate) query.interestRate.$gte = Number(minRate);
      if (maxRate) query.interestRate.$lte = Number(maxRate);
    }
    if (minAmount || maxAmount) {
      if (minAmount) query.maxAmount = { ...(query.maxAmount || {}), $gte: Number(minAmount) };
      if (maxAmount) query.minAmount = { ...(query.minAmount || {}), $lte: Number(maxAmount) };
    }

    const loans = await Loan.find(query).sort({ interestRate: 1 });

    res.status(200).json({
      success: true,
      count: loans.length,
      loans,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single loan by ID
// @route   GET /api/loans/:id
// @access  Public
export const getLoanById = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);
    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }
    res.status(200).json({ success: true, loan });
  } catch (error) {
    next(error);
  }
};

// @desc    Calculate EMI + summary + amortization
// @route   POST /api/loans/calculate-emi
// @access  Public
export const calculateEMI = async (req, res, next) => {
  try {
    const { principal, annualRate, tenureMonths, includeSchedule } = req.body;

    if (!principal || !annualRate || !tenureMonths) {
      return res.status(400).json({
        success: false,
        message: 'principal, annualRate, and tenureMonths are required',
      });
    }

    const summary = getLoanSummary(
      Number(principal),
      Number(annualRate),
      Number(tenureMonths)
    );

    const response = { success: true, summary };

    if (includeSchedule) {
      response.schedule = generateAmortizationSchedule(
        Number(principal),
        Number(annualRate),
        Number(tenureMonths)
      );
    }

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// @desc    Check affordability (uses logged-in user's income)
// @route   POST /api/loans/affordability
// @access  Private
export const checkLoanAffordability = async (req, res, next) => {
  try {
    const { emi } = req.body;
    if (!emi) {
      return res.status(400).json({ success: false, message: 'emi is required' });
    }

    const result = checkAffordability(
      Number(emi),
      req.user.monthlyIncome,
      req.user.existingEMIs
    );

    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

// @desc    Get personalized loan recommendations
// @route   POST /api/loans/recommendations
// @access  Private
export const getRecommendations = async (req, res, next) => {
  try {
    const {
      requestedAmount,
      preferredTenure = 36,
      loanType,
      limit = 3,
    } = req.body;

    const loans = await Loan.find({ isActive: true });

    const recommendations = getTopRecommendations(
      loans,
      {
        monthlyIncome: req.user.monthlyIncome,
        existingEMIs: req.user.existingEMIs,
        riskAppetite: req.user.riskAppetite,
        requestedAmount: Number(requestedAmount) || 0,
        preferredTenure: Number(preferredTenure),
        loanType,
      },
      Number(limit)
    );

    res.status(200).json({
      success: true,
      count: recommendations.length,
      recommendations,
    });
  } catch (error) {
    next(error);
  }
};