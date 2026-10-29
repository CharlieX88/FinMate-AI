import Budget from '../models/Budget.js';
import Watchlist from '../models/Watchlist.js';
import Alert from '../models/Alert.js';
import Lesson from '../models/Lesson.js';
import LessonProgress from '../models/LessonProgress.js';
import { calculateHealthScore } from '../utils/financialHealth.js';

// @desc    Get full dashboard data (without slow AI insights)
// @route   GET /api/dashboard
// @access  Private
export const getDashboardData = async (req, res, next) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    // 🔥 Parallel fetching for max speed
    const [
      summaryResult, 
      breakdownRaw, 
      unreadAlerts, 
      latestAlerts, 
      watchlistCount, 
      totalLessons, 
      completedLessons
    ] = await Promise.all([
      Budget.aggregate([
        { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Budget.aggregate([
        { $match: { user: req.user._id, type: 'expense', date: { $gte: start, $lte: end } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } },
        { $sort: { total: -1 } },
      ]),
      Alert.countDocuments({ user: req.user._id, isRead: false }),
      Alert.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(5),
      Watchlist.countDocuments({ user: req.user._id }),
      Lesson.countDocuments(),
      LessonProgress.countDocuments({ user: req.user._id, completed: true })
    ]);

    const income = summaryResult.find((r) => r._id === 'income')?.total || 0;
    const expense = summaryResult.find((r) => r._id === 'expense')?.total || 0;
    const savings = income - expense;
    const savingsRate = income > 0 ? Math.round((savings / income) * 10000) / 100 : 0;
    const budgetSummary = { income, expense, savings, savingsRate };

    const totalExp = breakdownRaw.reduce((s, b) => s + b.total, 0);
    const categoryBreakdown = breakdownRaw.map((b) => ({
      category: b._id,
      total: b.total,
      percent: totalExp > 0 ? Math.round((b.total / totalExp) * 10000) / 100 : 0,
    }));

    const health = calculateHealthScore(
      { monthlyIncome: req.user.monthlyIncome, existingEMIs: req.user.existingEMIs },
      budgetSummary
    );

    const learningPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    res.status(200).json({
      success: true,
      month,
      year,
      user: {
        name: req.user.name,
        monthlyIncome: req.user.monthlyIncome,
        monthlyExpenses: req.user.monthlyExpenses,
        existingEMIs: req.user.existingEMIs,
        financialGoal: req.user.financialGoal,
        riskAppetite: req.user.riskAppetite,
        isOnboarded: req.user.isOnboarded,
      },
      budgetSummary,
      categoryBreakdown,
      health,
      alerts: {
        unreadCount: unreadAlerts,
        latest: latestAlerts,
      },
      watchlistCount,
      learning: {
        totalLessons,
        completedLessons,
        percent: learningPercent,
      },
    });
  } catch (error) {
    next(error);
  }
};