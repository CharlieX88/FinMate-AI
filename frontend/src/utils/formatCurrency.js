export const formatINR = (amount) => {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
    }
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(2).replace(/\.00$/, '')} Lakh`;
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  };
  
  // EMI Calculator (Same as backend logic)
  export const calculateEMI = (principal, annualRate, tenureMonths) => {
    if (principal <= 0 || tenureMonths <= 0) return 0;
    if (annualRate === 0) return principal / tenureMonths;
    const monthlyRate = annualRate / 12 / 100;
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    const emi = (principal * monthlyRate * factor) / (factor - 1);
    return Math.round(emi);
  };