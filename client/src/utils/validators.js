// =============================================
// client/src/utils/validators.js
// Frontend User Input Validation Utility
// =============================================

export function validateName(name, fieldName = 'Name') {
  if (!name || !name.trim()) return `${fieldName} is required.`;
  const trimmed = name.trim();
  if (trimmed.length < 2) return `${fieldName} must be at least 2 characters long.`;
  if (trimmed.length > 50) return `${fieldName} cannot exceed 50 characters.`;
  
  // Rejects numbers and random symbols, allows letters, spaces, hyphens, apostrophes
  const nameRegex = /^[A-Za-z\s'\-\.]+$/;
  if (!nameRegex.test(trimmed)) {
    return `${fieldName} must contain only letters, spaces, or hyphens (numbers and special symbols are not allowed).`;
  }
  return null;
}

export function validateEmail(email) {
  if (!email || !email.trim()) return null; // Optional unless specified
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) {
    return 'Please enter a valid email address (e.g. name@example.com).';
  }
  return null;
}

export function validatePhone(phone, required = false) {
  if (!phone || !phone.trim()) {
    return required ? 'Phone number is required.' : null;
  }
  const trimmed = phone.trim();
  const phoneRegex = /^\+?[0-9\s\-\(\)]{7,20}$/;
  const digitCount = trimmed.replace(/\D/g, '').length;
  
  if (!phoneRegex.test(trimmed) || digitCount < 7 || digitCount > 15) {
    return 'Please enter a valid phone number (7 to 15 digits).';
  }
  return null;
}

export function validateDOB(dob) {
  if (!dob) return 'Date of Birth is required.';
  const dobDate = new Date(dob);
  if (isNaN(dobDate.getTime())) return 'Please select a valid Date of Birth.';
  
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  if (dobDate > today) return 'Date of Birth cannot be in the future.';
  
  const minDate = new Date();
  minDate.setFullYear(minDate.getFullYear() - 120);
  if (dobDate < minDate) return 'Date of Birth indicates an unrealistic age (over 120 years).';
  
  return null;
}

export function validateAmount(amount, fieldName = 'Amount') {
  if (amount === '' || amount === null || amount === undefined) {
    return `${fieldName} is required.`;
  }
  const num = Number(amount);
  if (isNaN(num) || num < 0) {
    return `${fieldName} must be a positive number.`;
  }
  return null;
}
