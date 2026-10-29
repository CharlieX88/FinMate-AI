import Budget from '../models/Budget.js';

// @desc    Add income/expense transaction
// @route   POST /api/budget
// @access  Private
export const addTransaction = async (req, res, next) => {
  try {
    const { type, category, amount, description, date } = req.body;

    if (!type || !category || !amount) {
      return res
        .status(400)
        .json({ success: false, message: 'type, category, and amount are required' });
    }

    const entry = await Budget.create({
      user: req.user._id,
      type,
      category,
      amount: Number(amount),
      description: description || '',
      date: date || Date.now(),
    });

    res.status(201).json({ success: true, entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions (with filters)
// @route   GET /api/budget
// @access  Private
export const getTransactions = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate, limit = 100 } = req.query;

    const query = { user: req.user._id };
    if (type) query.type = type.toLowerCase();
    if (category) query.category = { $regex: category, $options: 'i' };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const entries = await Budget.find(query)
      .sort({ date: -1 })
      .limit(Number(limit));

    res.status(200).json({ success: true, count: entries.length, entries });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a transaction
// @route   PUT /api/budget/:id
// @access  Private
export const updateTransaction = async (req, res, next) => {
  try {
    const { type, category, amount, description, date } = req.body;

    const entry = await Budget.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    if (type) entry.type = type;
    if (category) entry.category = category;
    if (amount !== undefined) entry.amount = Number(amount);
    if (description !== undefined) entry.description = description;
    if (date) entry.date = date;

    await entry.save();
    res.status(200).json({ success: true, entry });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/budget/:id
// @access  Private
export const deleteTransaction = async (req, res, next) => {
  try {
    const entry = await Budget.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!entry) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Monthly summary — income, expense, savings
// @route   GET /api/budget/summary?month=10&year=2025
// @access  Private
export const getMonthlySummary = async (req, res, next) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1; // 1-12
    const year = Number(req.query.year) || now.getFullYear();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const result = await Budget.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const income = result.find((r) => r._id === 'income')?.total || 0;
    const expense = result.find((r) => r._id === 'expense')?.total || 0;
    const savings = income - expense;
    const savingsRate = income > 0 ? Math.round((savings / income) * 10000) / 100 : 0;

    res.status(200).json({
      success: true,
      month,
      year,
      income,
      expense,
      savings,
      savingsRate, // percent
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Category-wise expense breakdown (chart ke liye)
// @route   GET /api/budget/category-breakdown?type=expense&month=10&year=2025
// @access  Private
export const getCategoryBreakdown = async (req, res, next) => {
  try {
    const now = new Date();
    const type = req.query.type || 'expense';
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    const breakdown = await Budget.aggregate([
      {
        $match: {
          user: req.user._id,
          type,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const total = breakdown.reduce((s, b) => s + b.total, 0);
    const withPercent = breakdown.map((b) => ({
      category: b._id,
      total: b.total,
      count: b.count,
      percent: total > 0 ? Math.round((b.total / total) * 10000) / 100 : 0,
    }));

    res.status(200).json({
      success: true,
      type,
      month,
      year,
      total,
      breakdown: withPercent,
    });
  } catch (error) {
    next(error);
  }
};