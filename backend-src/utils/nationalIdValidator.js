/**
 * Thai National ID Validation Utility
 * Comprehensive validation using official Thai National ID algorithm
 * 
 * Features:
 * - Thai National ID checksum validation using official algorithm
 * - Format validation (exactly 13 digits)
 * - Information extraction (birth date, type, province, etc.)
 * - Formatting functions for display
 * - Date of birth validation against National ID
 */

/**
 * Thai National ID Checksum Validation Algorithm
 * Based on the official Thai National ID validation algorithm
 * 
 * @param {string} nationalId - 13-digit National ID string
 * @returns {boolean} - true if checksum is valid
 */
function validateChecksum(nationalId) {
  if (!nationalId || nationalId.length !== 13) {
    return false;
  }

  // Convert string to array of digits
  const digits = nationalId.split('').map(Number);
  
  // Calculate checksum using official algorithm
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (13 - i);
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;
  
  return checkDigit === digits[12];
}

/**
 * Validate National ID format (exactly 13 digits)
 * 
 * @param {string} nationalId - National ID string
 * @returns {boolean} - true if format is valid
 */
function validateFormat(nationalId) {
  if (!nationalId) return false;
  
  // Remove any non-digit characters
  const cleanId = nationalId.replace(/\D/g, '');
  
  // Check if exactly 13 digits
  return /^\d{13}$/.test(cleanId);
}

/**
 * Extract birth date from National ID
 * 
 * @param {string} nationalId - 13-digit National ID
 * @returns {Object} - { year, month, day, fullDate, isValid }
 */
function extractBirthDate(nationalId) {
  if (!validateFormat(nationalId)) {
    return { isValid: false };
  }

  const digits = nationalId.split('').map(Number);
  
  // Extract birth date components
  const year = digits[0] * 10 + digits[1];
  const month = digits[2] * 10 + digits[3];
  const day = digits[4] * 10 + digits[5];
  
  // Determine century based on first digit
  let fullYear;
  if (digits[0] >= 0 && digits[0] <= 2) {
    // Born in 2000s
    fullYear = 2000 + year;
  } else if (digits[0] >= 3 && digits[0] <= 4) {
    // Born in 1900s
    fullYear = 1900 + year;
  } else if (digits[0] >= 5 && digits[0] <= 6) {
    // Born in 2100s (future)
    fullYear = 2100 + year;
  } else {
    return { isValid: false };
  }
  
  // Validate date
  const date = new Date(fullYear, month - 1, day);
  const isValidDate = date.getFullYear() === fullYear && 
                     date.getMonth() === month - 1 && 
                     date.getDate() === day;
  
  return {
    year: fullYear,
    month: month,
    day: day,
    fullDate: `${fullYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
    isValid: isValidDate
  };
}

/**
 * Extract National ID type and additional information
 * 
 * @param {string} nationalId - 13-digit National ID
 * @returns {Object} - { type, province, sequence, gender }
 */
function extractNationalIdInfo(nationalId) {
  if (!validateFormat(nationalId)) {
    return { isValid: false };
  }

  const digits = nationalId.split('').map(Number);
  
  // Extract province code (digits 7-8)
  const provinceCode = digits[6] * 10 + digits[7];
  
  // Extract sequence number (digits 9-12)
  const sequence = digits[8] * 1000 + digits[9] * 100 + digits[10] * 10 + digits[11];
  
  // Determine gender based on sequence number
  const gender = sequence % 2 === 0 ? 'female' : 'male';
  
  // Determine type based on first digit
  let type = 'citizen';
  if (digits[0] >= 3 && digits[0] <= 4) {
    type = 'citizen_1900s';
  } else if (digits[0] >= 5 && digits[0] <= 6) {
    type = 'citizen_future';
  }
  
  return {
    type,
    province: provinceCode,
    sequence,
    gender,
    isValid: true
  };
}

/**
 * Validate date of birth against National ID
 * 
 * @param {string} nationalId - 13-digit National ID
 * @param {string} birthDate - Birth date in YYYY-MM-DD format
 * @returns {Object} - { isValid, extractedDate, providedDate, match }
 */
function validateBirthDateAgainstId(nationalId, birthDate) {
  const extracted = extractBirthDate(nationalId);
  
  if (!extracted.isValid) {
    return {
      isValid: false,
      error: 'Invalid National ID format'
    };
  }
  
  if (!birthDate) {
    return {
      isValid: true,
      extractedDate: extracted.fullDate,
      providedDate: null,
      match: true
    };
  }
  
  // Normalize birth date format
  const normalizedBirthDate = birthDate.includes('-') ? birthDate : 
    birthDate.split('/').reverse().join('-');
  
  const match = extracted.fullDate === normalizedBirthDate;
  
  return {
    isValid: true,
    extractedDate: extracted.fullDate,
    providedDate: normalizedBirthDate,
    match: match
  };
}

/**
 * Format National ID for display
 * 
 * @param {string} nationalId - 13-digit National ID
 * @param {string} format - 'dashed', 'spaced', or 'raw'
 * @returns {string} - Formatted National ID
 */
function formatNationalId(nationalId, format = 'dashed') {
  if (!validateFormat(nationalId)) {
    return nationalId;
  }
  
  const cleanId = nationalId.replace(/\D/g, '');
  
  switch (format) {
    case 'dashed':
      return `${cleanId.slice(0, 1)}-${cleanId.slice(1, 5)}-${cleanId.slice(5, 10)}-${cleanId.slice(10, 12)}-${cleanId.slice(12)}`;
    case 'spaced':
      return `${cleanId.slice(0, 1)} ${cleanId.slice(1, 5)} ${cleanId.slice(5, 10)} ${cleanId.slice(10, 12)} ${cleanId.slice(12)}`;
    case 'raw':
    default:
      return cleanId;
  }
}

/**
 * Comprehensive National ID validation
 * 
 * @param {string} nationalId - National ID to validate
 * @param {Object} options - Validation options
 * @param {string} options.birthDate - Birth date to validate against
 * @param {boolean} options.checkChecksum - Whether to validate checksum (default: true)
 * @param {boolean} options.extractInfo - Whether to extract additional info (default: true)
 * @returns {Object} - Complete validation result
 */
function validateNationalId(nationalId, options = {}) {
  const {
    birthDate = null,
    checkChecksum = true,
    extractInfo = true
  } = options;
  
  // Clean input
  const cleanId = nationalId ? nationalId.replace(/\D/g, '') : '';
  
  // Basic validation
  const isValidFormat = validateFormat(cleanId);
  const isValidChecksum = checkChecksum ? validateChecksum(cleanId) : true;
  
  // Extract information
  let birthInfo = null;
  let idInfo = null;
  let birthDateValidation = null;
  
  if (isValidFormat) {
    birthInfo = extractBirthDate(cleanId);
    idInfo = extractInfo ? extractNationalIdInfo(cleanId) : null;
    
    if (birthDate) {
      birthDateValidation = validateBirthDateAgainstId(cleanId, birthDate);
    }
  }
  
  // Determine overall validity
  const isValid = isValidFormat && isValidChecksum && 
    (!birthDate || !birthDateValidation || birthDateValidation.match);
  
  return {
    isValid,
    nationalId: cleanId,
    formatted: isValidFormat ? formatNationalId(cleanId) : null,
    validation: {
      format: isValidFormat,
      checksum: isValidChecksum,
      birthDate: birthDateValidation ? birthDateValidation.match : true
    },
    extractedInfo: {
      birthDate: birthInfo,
      nationalId: idInfo
    },
    errors: getValidationErrors(isValidFormat, isValidChecksum, birthDateValidation)
  };
}

/**
 * Get validation error messages
 * 
 * @param {boolean} isValidFormat - Format validation result
 * @param {boolean} isValidChecksum - Checksum validation result
 * @param {Object} birthDateValidation - Birth date validation result
 * @returns {Array} - Array of error messages
 */
function getValidationErrors(isValidFormat, isValidChecksum, birthDateValidation) {
  const errors = [];
  
  if (!isValidFormat) {
    errors.push('เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก');
  }
  
  if (!isValidChecksum) {
    errors.push('เลขบัตรประชาชนไม่ถูกต้อง (checksum ไม่ผ่าน)');
  }
  
  if (birthDateValidation && !birthDateValidation.match) {
    errors.push('วันเกิดไม่ตรงกับเลขบัตรประชาชน');
  }
  
  return errors;
}

/**
 * Province code mapping (Thai provinces)
 * This is a simplified mapping - in production, you'd want a complete database
 */
const PROVINCE_CODES = {
  1: 'กรุงเทพมหานคร',
  2: 'สมุทรปราการ',
  3: 'นนทบุรี',
  4: 'ปทุมธานี',
  5: 'พระนครศรีอยุธยา',
  // Add more provinces as needed
};

/**
 * Get province name from code
 * 
 * @param {number} provinceCode - Province code
 * @returns {string} - Province name
 */
function getProvinceName(provinceCode) {
  return PROVINCE_CODES[provinceCode] || `จังหวัดรหัส ${provinceCode}`;
}

module.exports = {
  validateChecksum,
  validateFormat,
  extractBirthDate,
  extractNationalIdInfo,
  validateBirthDateAgainstId,
  formatNationalId,
  validateNationalId,
  getProvinceName,
  PROVINCE_CODES
};
