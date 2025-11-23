// Currency formatting utilities
export const formatCurrency = (amount: number, currency: string = "MAD"): string => {
  // Format for Moroccan Dirham (MAD)
  // Use fr-FR locale to avoid Arabic script issues in PDFs
  if (currency === "MAD") {
    return `${amount.toFixed(2)} MAD`;
  }
  
  // Default to MAD even if another currency is specified
  return `${amount.toFixed(2)} MAD`;
};

// Convert USD prices to MAD (using approximate exchange rate)
// 1 USD ≈ 10 MAD (approximate rate for display purposes)
export const convertToMAD = (usdAmount: number): number => {
  return usdAmount * 10;
};

// Convert MAD prices to USD (using approximate exchange rate)
export const convertToUSD = (madAmount: number): number => {
  return madAmount / 10;
};