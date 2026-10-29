import { calculateEMI } from './emiCalculator.js';

/**
 * Rule-based Loan Recommendation Engine
 * User ke income/need ke hisaab se best loans rank karta hai.
 * Score nikalta hai — jitna zyada, utna better.
 */

export const recommendLoans = (loans, userProfile) => {
  const {
    monthlyIncome = 0,
    existingEMIs = 0,
    requestedAmount = 0,
    preferredTenure = 36,
    loanType = null,
    riskAppetite = 'medium',
  } = userProfile;

  if (!loans || loans.length === 0) return [];

  const recommendations = loans
    .filter((loan) => {
      // Filter 1: income eligibility
      if (monthlyIncome > 0 && monthlyIncome < loan.minIncome) return false;

      // Filter 2: loan type preference
      if (loanType && loan.loanType !== loanType) return false;

      // Filter 3: amount within range
      if (requestedAmount > 0) {
        if (requestedAmount < loan.minAmount || requestedAmount > loan.maxAmount) {
          return false;
        }
      }

      return true;
    })
    .map((loan) => {
      // Use requested amount (clamped to range) ya max amount
      const amount = requestedAmount > 0
        ? Math.min(Math.max(requestedAmount, loan.minAmount), loan.maxAmount)
        : loan.maxAmount;

      // Use preferred tenure (clamped)
      const tenure = Math.min(Math.max(preferredTenure, loan.minTenure), loan.maxTenure);

      const emi = calculateEMI(amount, loan.interestRate, tenure);
      const totalPayable = emi * tenure;
      const totalInterest = totalPayable - amount;

      // --- Scoring (out of 100) ---
      let score = 0;

      // 1. Interest rate score (40 points) — lower is better
      // Rate 8% = 40 pts, 15% = 0 pts (linear)
      const rateScore = Math.max(0, Math.min(40, ((15 - loan.interestRate) / 7) * 40));

      // 2. Affordability score (30 points) — EMI/income ratio
      let affordabilityScore = 0;
      if (monthlyIncome > 0) {
        const totalEMI = emi + existingEMIs;
        const ratio = totalEMI / monthlyIncome;
        if (ratio <= 0.3) affordabilityScore = 30;
        else if (ratio <= 0.4) affordabilityScore = 22;
        else if (ratio <= 0.5) affordabilityScore = 12;
        else affordabilityScore = 0;
      } else {
        affordabilityScore = 15; // neutral if no income
      }

      // 3. Processing fee score (15 points) — lower is better
      const feeScore = Math.max(0, Math.min(15, 15 - loan.processingFeePercent * 5));

      // 4. Feature richness score (15 points)
      const featureScore = Math.min(15, (loan.features?.length || 0) * 5);

      // 5. Risk appetite bonus (only for low-risk users preferring lower EMI)
      if (riskAppetite === 'low' && emi <= monthlyIncome * 0.25) {
        score += 5;
      }

      score = rateScore + affordabilityScore + feeScore + featureScore;
      if (riskAppetite === 'low' && emi <= monthlyIncome * 0.25) score += 5;

      return {
        loan,
        emi,
        tenure,
        amount,
        totalPayable: Math.round(totalPayable * 100) / 100,
        totalInterest: Math.round(totalInterest * 100) / 100,
        score: Math.round(score * 10) / 10,
        breakdown: {
          rateScore: Math.round(rateScore * 10) / 10,
          affordabilityScore,
          feeScore: Math.round(feeScore * 10) / 10,
          featureScore,
        },
      };
    })
    .sort((a, b) => b.score - a.score); // high score first

  return recommendations;
};

// Top N recommendations (usually top 3)
export const getTopRecommendations = (loans, userProfile, limit = 3) => {
  return recommendLoans(loans, userProfile).slice(0, limit);
};