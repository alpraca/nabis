/**
 * Currency utilities for Albanian LEK
 */

export const formatPrice = (price) => {
  if (!price || price === 0) return '0 LEK';
  
  // Convert to number if string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) return '0 LEK';
  
  // Format with thousand separators and LEK suffix
  return new Intl.NumberFormat('sq-AL', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numPrice) + ' LEK';
};

export const formatPriceShort = (price) => {
  if (!price || price === 0) return '0L';
  
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) return '0L';
  
  // Format for compact display
  if (numPrice >= 1000) {
    return (numPrice / 1000).toFixed(1).replace('.0', '') + 'k LEK';
  }
  
  return numPrice.toLocaleString('sq-AL') + 'L';
};

export const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  
  // Remove LEK, L, and other currency symbols
  const cleanPrice = priceStr.toString()
    .replace(/[^\d.,]/g, '')
    .replace(/,/g, '');
  
  const numericPrice = parseFloat(cleanPrice);
  return isNaN(numericPrice) ? 0 : numericPrice;
};

export const isValidPrice = (price) => {
  const numPrice = typeof price === 'string' ? parsePrice(price) : price;
  return !isNaN(numPrice) && numPrice > 0;
};

export default {
  formatPrice,
  formatPriceShort,
  parsePrice,
  isValidPrice
};