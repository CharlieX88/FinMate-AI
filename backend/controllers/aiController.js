import {
  generateChatResponse,
  generateSpendingInsights,
  explainEMI,
  explainRecommendations,
} from '../utils/aiService.js';
import { getLoanSummary } from '../utils/emiCalculator.js';
import { getTopRecommendations } from '../utils/loanRecommender.js';
import Loan from '../models/Loan.js';
import Budget from '../models/Budget.js';

// @desc    AI Chatbot
// @route   POST /api/ai/chat
// @access  Private
export const chatWithAI = async (req, res, next) => {
  try { 
    const { message, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    const reply = await generateChatResponse(message, history || [], {
      monthlyIncome: req.user.monthlyIncome,
      monthlyExpenses: req.user.monthlyExpenses,
      existingEMIs: req.user.existingEMIs,
      financialGoal: req.user.financialGoal,
      riskAppetite: req.user.riskAppetite,
    });

    res.status(200).json({ success: true, reply });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate AI spending insights (dashboard)
// @route   GET /api/ai/insights
// @access  Private
export const getAIInsights = async (req, res, next) => {
  try {
    const now = new Date();
    const month = Number(req.query.month) || now.getMonth() + 1;
    const year = Number(req.query.year) || now.getFullYear();

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59, 999);

    // Aggregate summary
    const summaryResult = await Budget.aggregate([
      { $match: { user: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);
    const income = summaryResult.find((r) => r._id === 'income')?.total || 0;
    const expense = summaryResult.find((r) => r._id === 'expense')?.total || 0;
    const savings = income - expense;
    const savingsRate = income > 0 ? Math.round((savings / income) * 10000) / 100 : 0;
    const summary = { income, expense, savings, savingsRate };

    // Category breakdown (expenses)
    const breakdownRaw = await Budget.aggregate([
      { $match: { user: req.user._id, type: 'expense', date: { $gte: start, $lte: end } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]);
    const totalExp = breakdownRaw.reduce((s, b) => s + b.total, 0);
    const categoryBreakdown = breakdownRaw.map((b) => ({
      category: b._id,
      total: b.total,
      percent: totalExp > 0 ? Math.round((b.total / totalExp) * 10000) / 100 : 0,
    }));

    const insight = await generateSpendingInsights(summary, categoryBreakdown);

    res.status(200).json({ success: true, insight, summary, categoryBreakdown });
  } catch (error) {
    next(error);
  }
};

// @desc    Explain EMI in natural language
// @route   POST /api/ai/explain-emi
// @access  Public
export const aiExplainEMI = async (req, res, next) => {
  try {
    const { principal, annualRate, tenureMonths } = req.body;

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

    const explanation = await explainEMI(summary);

    res.status(200).json({ success: true, summary, explanation });
  } catch (error) {
    next(error);
  }
};

// @desc    Explain loan recommendations in natural language
// @route   POST /api/ai/explain-recommendations
// @access  Private
export const aiExplainRecommendations = async (req, res, next) => {
  try {
    const { requestedAmount, preferredTenure = 36, loanType } = req.body;

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
      3
    );

    const explanation = await explainRecommendations(recommendations, {
      monthlyIncome: req.user.monthlyIncome,
      financialGoal: req.user.financialGoal,
    });

    res.status(200).json({
      success: true,
      explanation,
      top: recommendations[0] || null,
      count: recommendations.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate loan scenario with best bank + AI reality check
// @route   POST /api/ai/simulate-loan
// @access  Private
export const simulateLoanScenario = async (req, res, next) => {
  try {
    if (!req.user.monthlyIncome || req.user.monthlyIncome <= 0) {
      return res.status(400).json({ success: false, message: 'Please set your monthly income in Profile first.' });
    }

    const { requestedAmount, preferredTenure } = req.body;

    const loans = await Loan.find({ isActive: true });
    const recommendations = getTopRecommendations(loans, {
      monthlyIncome: req.user.monthlyIncome,
      existingEMIs: req.user.existingEMIs,
      riskAppetite: req.user.riskAppetite,
      requestedAmount: Number(requestedAmount) || 0,
      preferredTenure: Number(preferredTenure) || 36,
      loanType: null,
    }, 1);

    if (!recommendations || recommendations.length === 0) {
      return res.status(404).json({ success: false, message: 'No suitable loans found for this amount.' });
    }

    const bestMatch = recommendations[0];
    const P = bestMatch.amount;
    const rate = bestMatch.loan.interestRate;
    const preferredTenureNum = Number(preferredTenure);

    const loanSummary = getLoanSummary(P, rate, preferredTenureNum);

    // --- CALCULATE OPTIMAL TENURE ---
    const maxEmiCapacity = (req.user.monthlyIncome * 0.35) - req.user.existingEMIs;
    let optimalTenure = preferredTenureNum;
    
    if (maxEmiCapacity > 0) {
      const r = rate / 12 / 100;
      const calculatedMonths = -Math.log(1 - (P * r) / maxEmiCapacity) / Math.log(1 + r);
      
      if (!isNaN(calculatedMonths) && calculatedMonths < preferredTenureNum && calculatedMonths > 12) {
        optimalTenure = Math.ceil(calculatedMonths);
      }
    }

    let optimalSummary = null;
    if (optimalTenure !== preferredTenureNum) {
      optimalSummary = getLoanSummary(P, rate, optimalTenure);
    }

    // --- AI EXPLANATION ---
    const aiExplanation = await explainEMI(
      {
        ...loanSummary,
        bankName: bestMatch.loan.bankName,
      },
      {
        monthlyIncome: req.user.monthlyIncome,
        existingEMIs: req.user.existingEMIs,
        monthlyExpenses: req.user.monthlyExpenses,
        optimalTenure: optimalTenure !== preferredTenureNum ? optimalTenure : null,
        optimalEmi: optimalSummary ? optimalSummary.emi : null,
        optimalInterest: optimalSummary ? optimalSummary.totalInterest : null,
        interestSaved: optimalSummary ? (loanSummary.totalInterest - optimalSummary.totalInterest) : 0
      }
    );

    res.status(200).json({
      success: true,
      bestLoan: bestMatch,
      summary: loanSummary,
      aiExplanation,
      optimalTenure: optimalTenure !== preferredTenureNum ? optimalTenure : null,
    });
  } catch (error) {
    next(error);
  }
};  