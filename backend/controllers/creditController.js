import CreditProfile from '../models/CreditProfile.js';
import { calculateCreditScore } from '../utils/creditScoreCalculator.js';
import { generateCreditAdvice } from '../utils/aiService.js';

// @desc    Calculate and Save Credit Score
// @route   POST /api/credit/calculate
// @access  Private
export const calculateAndSaveScore = async (req, res, next) => {
  try {
    const {
      onTimePaymentPercentage,
      creditUtilizationPercentage,
      creditHistoryMonths,
      hasCreditCard,
      hasActiveLoan,
      recentInquiries
    } = req.body;

    // 1. Calculate Score
    const scoreData = calculateCreditScore({
      onTimePaymentPercentage,
      creditUtilizationPercentage,
      creditHistoryMonths,
      hasCreditCard,
      hasActiveLoan,
      recentInquiries
    });

    // 2. Get AI Advice
    const aiAdvice = await generateCreditAdvice(scoreData, {
      creditUtilizationPercentage,
      recentInquiries
    });

    // 3. Save or Update in DB
    let profile = await CreditProfile.findOne({ user: req.user._id });
    
    const profileData = {
      onTimePaymentPercentage,
      creditUtilizationPercentage,
      creditHistoryMonths,
      hasCreditCard,
      hasActiveLoan,
      recentInquiries,
      calculatedScore: scoreData.score
    };

    if (profile) {
      profile = await CreditProfile.findOneAndUpdate(
        { user: req.user._id },
        profileData,
        { new: true }
      );
    } else {
      profile = await CreditProfile.create({
        user: req.user._id,
        ...profileData
      });
    }

    res.status(200).json({
      success: true,
      scoreData,
      aiAdvice,
      profile
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current credit profile
// @route   GET /api/credit
// @access  Private
export const getCreditProfile = async (req, res, next) => {
  try {
    const profile = await CreditProfile.findOne({ user: req.user._id });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'No credit profile found' });
    }
    res.status(200).json({ success: true, profile });
  } catch (error) {
    next(error);
  }
};