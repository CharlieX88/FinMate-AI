/**
 * Financial Health Score (0-100)
 * Components:
 *  - Savings Rate          → 40 pts
 *  - EMI Burden            → 30 pts
 *  - Expense Control       → 20 pts
 *  - Emergency Buffer      → 10 pts
 */

export const calculateHealthScore = (userData, budgetSummary) => {
    const { monthlyIncome = 0, existingEMIs = 0 } = userData || {};
    const {
      income: budgetIncome = 0,
      expense = 0,
      savings = 0,
      savingsRate = 0,
    } = budgetSummary || {};
  
    const effectiveIncome = budgetIncome > 0 ? budgetIncome : monthlyIncome;
  
    if (effectiveIncome <= 0) {
      return {
        score: 0,
        grade: 'N/A',
        status: 'Complete onboarding and add income to see your score.',
        breakdown: [],
        tips: ['First complete onboarding, then add your monthly income and expenses.'],
      };
    }
  
    // 1. Savings Rate Score (40 pts)
    let savingsScore = 0;
    if (savingsRate >= 30) savingsScore = 40;
    else if (savingsRate >= 20) savingsScore = 30;
    else if (savingsRate >= 10) savingsScore = 20;
    else if (savingsRate >= 5) savingsScore = 10;
    else savingsScore = Math.max(0, Math.round(savingsRate * 2));
  
    // 2. EMI Burden Score (30 pts)
    const emiRatio = (existingEMIs / effectiveIncome) * 100;
    let emiScore = 0;
    if (emiRatio <= 20) emiScore = 30;
    else if (emiRatio <= 30) emiScore = 22;
    else if (emiRatio <= 40) emiScore = 12;
    else if (emiRatio <= 50) emiScore = 5;
    else emiScore = 0;
  
    // 3. Expense Control Score (20 pts)
    const expenseRatio = (expense / effectiveIncome) * 100;
    let expenseScore = 0;
    if (expenseRatio <= 50) expenseScore = 20;
    else if (expenseRatio <= 70) expenseScore = 15;
    else if (expenseRatio <= 85) expenseScore = 10;
    else if (expenseRatio <= 100) expenseScore = 5;
    else expenseScore = 0;
  
    // 4. Emergency Buffer Score (10 pts)
    const monthsBuffer = savings > 0 ? savings / effectiveIncome : 0;
    let bufferScore = 0;
    if (monthsBuffer >= 3) bufferScore = 10;
    else if (monthsBuffer >= 1) bufferScore = 7;
    else if (monthsBuffer > 0) bufferScore = 4;
  
    const score = Math.round(savingsScore + emiScore + expenseScore + bufferScore);
  
    let grade = 'Poor';
    let status = 'Your finances need attention.';
    if (score >= 80) {
      grade = 'Excellent';
      status = 'Your financial health is excellent! 🎉';
    } else if (score >= 60) {
      grade = 'Good';
      status = 'Good — you can improve a little further.';
    } else if (score >= 40) {
      grade = 'Fair';
      status = 'Fair — there is room for improvement.';
    }
  
    const tips = [];
    if (savingsScore < 30)
      tips.push(`Increase your savings rate — currently ${savingsRate}%, target 30%.`);
    if (emiScore < 22)
      tips.push(`EMI burden is high (${Math.round(emiRatio)}% of income). Clear existing debt before taking new loans.`);
    if (expenseScore < 15)
      tips.push(`Expenses are high (${Math.round(expenseRatio)}% of income). Review your categories.`);
    if (bufferScore < 7)
      tips.push('Build an emergency fund covering 3 months of expenses.');
  
    return {
      score,
      grade,
      status,
      breakdown: [
        { label: 'Savings Rate', score: savingsScore, max: 40, value: `${savingsRate}%` },
        { label: 'EMI Burden', score: emiScore, max: 30, value: `${Math.round(emiRatio)}%` },
        { label: 'Expense Control', score: expenseScore, max: 20, value: `${Math.round(expenseRatio)}%` },
        { label: 'Emergency Buffer', score: bufferScore, max: 10, value: `${monthsBuffer.toFixed(1)} mo` },
      ],
      tips: tips.length > 0 ? tips : ['Everything looks good! Keep it up. 💪'],
    };
  };