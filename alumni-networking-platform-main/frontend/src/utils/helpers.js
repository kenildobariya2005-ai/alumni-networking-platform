/**
 * Utility helper functions for AlumniConnect frontend
 */

/**
 * Format date string into human readable format
 * @param {string|Date} date
 * @param {object} options
 * @returns {string}
 */
export const formatDate = (date, options = {}) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const defaultOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  };
  
  return new Intl.DateTimeFormat('en-US', defaultOptions).format(d);
};

/**
 * Get initials from full name for avatar placeholder
 * @param {string} name
 * @returns {string}
 */
export const getInitials = (name = '') => {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/**
 * Truncate long string with ellipsis
 * @param {string} str
 * @param {number} length
 * @returns {string}
 */
export const truncateString = (str = '', length = 100) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return `${str.substring(0, length)}...`;
};

/**
 * Capitalize first letter of string
 * @param {string} str
 * @returns {string}
 */
export const capitalize = (str = '') => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
