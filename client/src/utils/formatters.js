/**
 * Format a date string into a human-readable format
 * @param {string} dateString 
 * @returns {string} Formatted date
 */
/**
 * Format a date string into a human-readable format
 * @param {string} dateString - The date string to format
 * @param {string} format - Optional format ('default', 'short', 'time')
 * @returns {string} Formatted date
 */
export const formatDate = (dateString, format = 'default') => {
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  // Different format options
  if (format === 'short') {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  }
  
  if (format === 'time') {
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  
  // Default format (day month year)
  const options = { 
    day: '2-digit', 
    month: 'short', 
    year: 'numeric' 
  };
  
  return date.toLocaleDateString('en-GB', options);
};
  
  /**
   * Format a number as currency (Euro)
   * @param {number} value - The number to format
   * @returns {string} Formatted currency string
   */
  export const formatCurrency = (value) => {
    // Handle null, undefined, or invalid values
    if (value === null || value === undefined || isNaN(value)) {
      return '€0.00';
    }
    
    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numValue);
  };
  
  /**
   * @param {number} value - The number to format
   * @returns {string} Formatted number string
   */
  export const formatNumber = (value) => {
    // Handle null, undefined, or invalid values
    if (value === null || value === undefined || isNaN(value)) {
      return '0';
    }
    
    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    return new Intl.NumberFormat('it-IT').format(numValue);
  };