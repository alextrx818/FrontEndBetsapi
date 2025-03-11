export const decimalToAmerican = (decimal) => {
  try {
    const decimalOdds = parseFloat(decimal);
    if (decimalOdds <= 1) return 0;
    if (decimalOdds >= 2) {
      return Math.round((decimalOdds - 1) * 100);
    } else {
      return Math.round(-100 / (decimalOdds - 1));
    }
  } catch (error) {
    return 0;
  }
};

export const formatOdds = (odds) => {
  try {
    const decimalOdds = parseFloat(odds);
    if (isNaN(decimalOdds)) return odds;
    
    const american = decimalToAmerican(decimalOdds);
    return `${american > 0 ? '+' : ''}${american}`;
  } catch (error) {
    return odds;
  }
};