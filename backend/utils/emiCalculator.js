/**
 * EMI Calculator Utility
 * Standard reducing balance formula:
 * EMI = [P × r × (1+r)^n] / [(1+r)^n − 1]
 * P = Principal, r = monthly interest rate, n = tenure in months
 */

// Calculate monthly EMI
export const calculateEMI = (principal, annualRate, tenureMonths) => {
    if (principal <= 0 || tenureMonths <= 0) return 0;
    if (annualRate === 0) return principal / tenureMonths;
  
    const monthlyRate = annualRate / 12 / 100;
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
  
    const emi = (principal * monthlyRate * factor) / (factor - 1);
    return Math.round(emi * 100) / 100;
  };
  
  // Total amount payable over full tenure
  export const calculateTotalPayable = (emi, tenureMonths) => {
    return Math.round(emi * tenureMonths * 100) / 100;
  };
  
  // Total interest paid over tenure
  export const calculateTotalInterest = (totalPayable, principal) => {
    return Math.round((totalPayable - principal) * 100) / 100;
  };
  
  // Full amortization schedule (month-wise breakdown)
  export const generateAmortizationSchedule = (principal, annualRate, tenureMonths) => {
    const emi = calculateEMI(principal, annualRate, tenureMonths);
    const monthlyRate = annualRate / 12 / 100;
  
    let balance = principal;
    const schedule = [];
  
    for (let month = 1; month <= tenureMonths; month++) {
      const interest = Math.round(balance * monthlyRate * 100) / 100;
      const principalPaid = Math.round((emi - interest) * 100) / 100;
      balance = Math.round((balance - principalPaid) * 100) / 100;
  
      schedule.push({
        month,
        emi,
        interest,
        principal: principalPaid,
        balance: balance < 0 ? 0 : balance,
      });
    }
  
    return schedule;
  };
  
  // Full summary — ek hi call mein sab kuch
  export const getLoanSummary = (principal, annualRate, tenureMonths) => {
    const emi = calculateEMI(principal, annualRate, tenureMonths);
    const totalPayable = calculateTotalPayable(emi, tenureMonths);
    const totalInterest = calculateTotalInterest(totalPayable, principal);
  
    return {
      principal,
      annualRate,
      tenureMonths,
      emi,
      totalPayable,
      totalInterest,
    };
  };
  
  // Affordability check (rule-based)
  export const checkAffordability = (emi, monthlyIncome, existingEMIs = 0) => {
    if (monthlyIncome <= 0) {
      return {
        affordable: false,
        reason: 'Monthly income must be greater than 0',
        emiToIncomeRatio: null,
        recommendation: 'Please complete onboarding first',
      };
    }
  
    const totalEMI = emi + existingEMIs;
    const ratio = totalEMI / monthlyIncome;
  
    let affordable = false;
    let reason = '';
    let recommendation = '';
  
    if (ratio <= 0.3) {
      affordable = true;
      reason = 'EMI is within safe limit (< 30% of income)';
      recommendation = 'This loan is comfortably affordable for you.';
    } else if (ratio <= 0.4) {
      affordable = true;
      reason = 'EMI is within acceptable limit (30-40% of income)';
      recommendation = 'Affordable, but manage other expenses carefully.';
    } else if (ratio <= 0.5) {
      affordable = false;
      reason = 'EMI is high (40-50% of income) — risky';
      recommendation = 'Consider a longer tenure or lower loan amount.';
    } else {
      affordable = false;
      reason = 'EMI exceeds 50% of income — very risky';
      recommendation = 'Not recommended. Reduce loan amount significantly.';
    }
  
    return {
      affordable,
      reason,
      recommendation,
      emiToIncomeRatio: Math.round(ratio * 10000) / 100, // percent, 2 decimals
      totalEMI: Math.round(totalEMI * 100) / 100,
      monthlyIncome,
    };
  };