// =============================================
// server/src/utils/validators.js
// Centralized Backend Data Validation Utility
// =============================================

/**
 * Validates person names (First Name, Last Name)
 * Allows: Letters, spaces, apostrophes, hyphens, periods
 * Rejects: Numbers, random symbols, empty/too short/too long strings
 * Examples:
 *   Valid: "Anushka Yadav", "Rahul Kumar", "O'Connor", "Mary-Jane", "Dr. Smith"
 *   Invalid: "12345", "99999", "@#$%", "123456 Anushka"
 */
function isValidName(name) {
  if (!name || typeof name !== 'string') return false;
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 50) return false;
  const nameRegex = /^[A-Za-z\s'\-\.]+$/;
  return nameRegex.test(trimmed);
}

/**
 * Validates Email Address format
 * Examples:
 *   Valid: "example@gmail.com", "patient@pulsecare.local"
 *   Invalid: "abc", "abc@", "abc.com@"
 */
function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates Phone Numbers
 * Accepts 7 to 15 digits with optional +, spaces, or hyphens
 * Rejects letters or non-phone symbols
 */
function isValidPhone(phone, required = false) {
  if (!phone) return !required;
  const trimmed = String(phone).trim();
  const phoneRegex = /^\+?[0-9\s\-\(\)]{7,20}$/;
  const digitCount = trimmed.replace(/\D/g, '').length;
  return phoneRegex.test(trimmed) && digitCount >= 7 && digitCount <= 15;
}

/**
 * Validates Date of Birth
 * Must be a valid date, not in the future, and not older than 120 years
 */
function isValidDOB(dob) {
  if (!dob) return false;
  const dobDate = new Date(dob);
  if (isNaN(dobDate.getTime())) return false;
  
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (dobDate > today) return false;

  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  if (dobDate < minDate) return false;

  return true;
}

/**
 * Validates Gender against allowed set
 */
function isValidGender(gender) {
  const allowed = ['Female', 'Male', 'Other'];
  return allowed.includes(gender);
}

/**
 * Validates Blood Group against allowed set
 */
function isValidBloodGroup(bg) {
  if (!bg) return true;
  const allowed = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'];
  return allowed.includes(bg);
}

/**
 * Validates numeric amounts (e.g. consultation fee, payment amount)
 * Must be a finite non-negative number
 */
function isValidAmount(amount) {
  const num = Number(amount);
  return !isNaN(num) && isFinite(num) && num >= 0;
}

/**
 * Validates password strength (minimum 6 characters)
 */
function isValidPassword(password) {
  if (!password || typeof password !== 'string') return false;
  return password.length >= 6;
}

module.exports = {
  isValidName,
  isValidEmail,
  isValidPhone,
  isValidDOB,
  isValidGender,
  isValidBloodGroup,
  isValidAmount,
  isValidPassword,
};
