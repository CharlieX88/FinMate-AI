/**
 * Rule-based Credit Score Simulator (Range: 300 to 900)
 */
export const calculateCreditScore = (profile) => {
  let score = 300; // Base score

  // 1. Payment History (Max: 315 points)
  let paymentScore = (profile.onTimePaymentPercentage / 100) * 315;
  score += paymentScore;

  // 2. Credit Utilization (Max: 270 points)
  let utilizationScore = 0;
  if (profile.creditUtilizationPercentage <= 30) utilizationScore = 270;
  else if (profile.creditUtilizationPercentage <= 50) utilizationScore = 200;
  else if (profile.creditUtilizationPercentage <= 75) utilizationScore = 100;
  else utilizationScore = 0;
  score += utilizationScore;

  // 3. Credit History Length (Max: 135 points)
  let historyScore = 0;
  if (profile.creditHistoryMonths >= 60) historyScore = 135;
  else if (profile.creditHistoryMonths >= 36) historyScore = 100;
  else if (profile.creditHistoryMonths >= 12) historyScore = 50;
  else historyScore = 0; // Agar history 1 saal se kam hai, toh 0 points
  score += historyScore;

  // 4. Credit Mix (Max: 90 points)
  let mixScore = 0;
  if (profile.hasCreditCard && profile.hasActiveLoan) mixScore = 90;
  else if (profile.hasCreditCard || profile.hasActiveLoan) mixScore = 50;
  else mixScore = 0;
  score += mixScore;

  // 5. New Inquiries (Max: 90 points)
  let inquiryScore = 0;
  if (profile.recentInquiries === 0) inquiryScore = 90;
  else if (profile.recentInquiries === 1) inquiryScore = 60;
  else if (profile.recentInquiries === 2) inquiryScore = 30;
  else inquiryScore = 0;
  score += inquiryScore;

  // 🚨 REALITY CHECK (Strict Caps) 🚨
  // Agar payment history kharab hai, toh score cap ho jayega
  if (profile.onTimePaymentPercentage < 50) {
    score = Math.min(score, 400); // Never pay on time = Max 400 score
  } else if (profile.onTimePaymentPercentage < 80) {
    score = Math.min(score, 600); // Irregular payer = Max 600 score
  }

  // Cap the score at 900 and floor at 300
  const finalScore = Math.min(900, Math.max(300, Math.round(score)));

  // Determine Grade
  let grade = 'Poor';
  let color = 'red';
  if (finalScore >= 750) { grade = 'Excellent'; color = 'green'; }
  else if (finalScore >= 700) { grade = 'Good'; color = 'blue'; }
  else if (finalScore >= 650) { grade = 'Fair'; color = 'yellow'; }

  return {
    score: finalScore,
    grade,
    color,
    breakdown: {
      paymentHistory: Math.round(paymentScore),
      utilization: Math.round(utilizationScore),
      historyLength: Math.round(historyScore),
      creditMix: Math.round(mixScore),
      inquiries: Math.round(inquiryScore)
    }
  };
};