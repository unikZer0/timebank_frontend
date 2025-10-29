/**
 * Frontend National ID Validation Example
 * Complete frontend example with HTML and JavaScript
 * 
 * Features:
 * - Real-time validation as user types
 * - Debounced API calls (500ms delay)
 * - Visual feedback (green/red borders, messages)
 * - Input restrictions (numbers only)
 * - Auto-formatting options
 * - Error message customization
 */

// Configuration
const CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api',
  DEBOUNCE_DELAY: 300, // Reduced for more responsive feel
  VALIDATION_ENDPOINT: '/auth/validate-national-id'
};

// State management
let validationState = {
  isValid: null,
  isValidating: false,
  error: null,
  data: null,
  debounceTimer: null
};

/**
 * Initialize National ID validation
 */
function initNationalIdValidation() {
  const nationalIdInput = document.getElementById('nationalId');
  const birthDateInput = document.getElementById('birthDate');
  const submitButton = document.getElementById('submitButton');
  
  if (!nationalIdInput) {
    console.error('National ID input not found');
    return;
  }

  // Add event listeners
  nationalIdInput.addEventListener('input', handleNationalIdInput);
  nationalIdInput.addEventListener('blur', handleNationalIdBlur);
  nationalIdInput.addEventListener('keypress', handleKeyPress);
  
  if (submitButton) {
    submitButton.addEventListener('click', handleFormSubmit);
  }

  // Initial validation state
  updateValidationUI();
}

/**
 * Handle National ID input changes
 */
function handleNationalIdInput(event) {
  const input = event.target;
  const value = input.value;
  
  // Only allow numbers
  const numericValue = value.replace(/\D/g, '');
  
  // Limit to 13 digits
  const limitedValue = numericValue.slice(0, 13);
  
  // Update input value
  input.value = limitedValue;
  
  // Clear previous timer
  if (validationState.debounceTimer) {
    clearTimeout(validationState.debounceTimer);
  }
  
  // Reset validation state for new input
  validationState.isValid = null;
  validationState.error = null;
  validationState.data = null;
  updateValidationUI();
  
  // Set up debounced validation for any input length > 0
  if (limitedValue.length > 0) {
    validationState.debounceTimer = setTimeout(() => {
      validateNationalId(limitedValue);
    }, CONFIG.DEBOUNCE_DELAY);
  }
}

/**
 * Handle National ID input blur
 */
function handleNationalIdBlur(event) {
  const value = event.target.value;
  
  if (value.length > 0) {
    validateNationalId(value);
  }
}

/**
 * Handle key press (prevent non-numeric input)
 */
function handleKeyPress(event) {
  const char = String.fromCharCode(event.which);
  if (!/\d/.test(char)) {
    event.preventDefault();
  }
}

/**
 * Validate National ID via API with progressive feedback
 */
async function validateNationalId(nationalId) {
  validationState.isValidating = true;
  updateValidationUI();
  
  try {
    // First, do basic format validation
    if (nationalId.length < 13) {
      validationState.isValid = null;
      validationState.isValidating = false;
      validationState.error = `กรุณากรอกเลขบัตรประชาชนให้ครบ 13 หลัก (เหลืออีก ${13 - nationalId.length} หลัก)`;
      validationState.data = null;
      updateValidationUI();
      return;
    }

    if (!/^\d{13}$/.test(nationalId)) {
      validationState.isValid = false;
      validationState.isValidating = false;
      validationState.error = 'เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น';
      validationState.data = null;
      updateValidationUI();
      return;
    }

    // Try backend API first, fallback to mock validation
    let data;
    try {
      const birthDate = document.getElementById('birthDate')?.value;
      
      const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.VALIDATION_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nationalId: nationalId,
          birthDate: birthDate || null,
          checkDuplicates: true,
          verifyExternal: false
        })
      });
      
      data = await response.json();
    } catch (error) {
      console.warn('Backend not available, using mock validation:', error);
      data = await mockValidateNationalId(nationalId);
    }
    
    if (data.success) {
      validationState.isValid = true;
      validationState.error = null;
      validationState.data = data.data;
      
      // Auto-format the input if validation is successful
      const input = document.getElementById('nationalId');
      if (data.data.formatted) {
        input.value = data.data.formatted;
      }
    } else {
      validationState.isValid = false;
      validationState.error = data.message || 'เลขบัตรประชาชนไม่ถูกต้อง';
      validationState.data = data.data;
    }
  } catch (error) {
    validationState.isValid = false;
    validationState.error = 'เกิดข้อผิดพลาดในการตรวจสอบ';
    validationState.data = null;
    console.error('Validation error:', error);
  } finally {
    validationState.isValidating = false;
    updateValidationUI();
  }
}

/**
 * Mock validation function for offline testing
 */
async function mockValidateNationalId(nationalId) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Check if National ID is already in use in database
  const mockCitizen = await mockLookupCitizen(nationalId);
  
  // If found in database, show "in use" message
  if (mockCitizen) {
    console.log('National ID found in database:', mockCitizen);
    return {
      success: false,
      message: 'เลขบัตรประชาชนนี้มีผู้ใช้งานแล้ว',
      code: 'DUPLICATE_NATIONAL_ID',
      data: {
        duplicateCheck: {
          exists: true,
          userId: mockCitizen.id,
          registeredAt: new Date().toISOString(),
          citizenInfo: {
            firstName: mockCitizen.first_name,
            lastName: mockCitizen.last_name,
            dateOfBirth: mockCitizen.date_of_birth,
            gender: mockCitizen.gender,
            address: mockCitizen.address,
            contact: mockCitizen.contact,
            criminalRecord: mockCitizen.criminal_record
          }
        }
      }
    };
  }
  
  console.log('National ID not found in database, proceeding with validation');
  
  // Mock checksum validation (only if not found in database)
  const isValidChecksum = validateMockChecksum(nationalId);
  
  if (!isValidChecksum) {
    return {
      success: false,
      message: 'เลขบัตรประชาชนไม่ถูกต้อง (checksum ไม่ผ่าน)',
      code: 'INVALID_CHECKSUM'
    };
  }
  
  // Extract birth date from National ID
  const extractedBirthDate = extractMockBirthDate(nationalId);
  
  return {
    success: true,
    message: 'เลขบัตรประชาชนถูกต้อง',
    data: {
      nationalId: nationalId,
      formatted: formatMockNationalId(nationalId),
      extractedInfo: {
        birthDate: {
          year: parseInt(nationalId.slice(0, 2)) + (parseInt(nationalId[0]) >= 3 ? 1900 : 2000),
          month: parseInt(nationalId.slice(2, 4)),
          day: parseInt(nationalId.slice(4, 6)),
          fullDate: extractedBirthDate,
          isValid: true
        },
        nationalId: {
          type: 'citizen',
          province: parseInt(nationalId.slice(6, 8)),
          sequence: parseInt(nationalId.slice(8, 12)),
          gender: parseInt(nationalId.slice(12, 13)) % 2 === 0 ? 'female' : 'male',
          isValid: true
        }
      },
      validation: {
        format: true,
        checksum: isValidChecksum,
        birthDate: true
      },
      duplicateCheck: mockCitizen ? {
        exists: true,
        userId: mockCitizen.id,
        registeredAt: new Date().toISOString(),
        citizenInfo: {
          firstName: mockCitizen.first_name,
          lastName: mockCitizen.last_name,
          dateOfBirth: mockCitizen.date_of_birth,
          gender: mockCitizen.gender,
          address: mockCitizen.address,
          contact: mockCitizen.contact,
          criminalRecord: mockCitizen.criminal_record
        }
      } : {
        exists: false,
        userId: null,
        registeredAt: null,
        citizenInfo: null
      },
      externalVerification: {
        verified: true,
        source: 'mock_citizens_database',
        verifiedAt: new Date().toISOString(),
        details: {
          status: 'verified',
          message: 'National ID verified with mock citizens database',
          criminalRecord: mockCitizen?.criminal_record || { criminal_record: false, record_details: [] },
          citizenInfo: mockCitizen ? {
            firstName: mockCitizen.first_name,
            lastName: mockCitizen.last_name,
            dateOfBirth: mockCitizen.date_of_birth,
            gender: mockCitizen.gender,
            address: mockCitizen.address,
            contact: mockCitizen.contact
          } : null
        }
      }
    }
  };
}

// Mock checksum validation (simplified version)
function validateMockChecksum(nationalId) {
  const digits = nationalId.split('').map(Number);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (13 - i);
  }
  const remainder = sum % 11;
  const checkDigit = remainder < 2 ? remainder : 11 - remainder;
  return checkDigit === digits[12];
}

// Mock citizen lookup
async function mockLookupCitizen(nationalId) {
  try {
    console.log('Looking up National ID in database:', nationalId);
    const response = await fetch('https://pub-f1ab9efe03eb4ce7afd952fc03688236.r2.dev/mock_thai_citizens_with_criminal.json');
    const data = await response.json();
    
    console.log('Database response:', data);
    
    if (data.success && data.data) {
      const foundCitizen = data.data.find(citizen => citizen.national_id === nationalId);
      console.log('Found citizen:', foundCitizen);
      return foundCitizen;
    }
  } catch (error) {
    console.warn('Failed to fetch mock citizens data:', error);
  }
  console.log('No citizen found for National ID:', nationalId);
  return null;
}

// Extract birth date from National ID
function extractMockBirthDate(nationalId) {
  if (nationalId.length !== 13) return null;
  
  const year = parseInt(nationalId.slice(0, 2));
  const month = parseInt(nationalId.slice(2, 4));
  const day = parseInt(nationalId.slice(4, 6));
  
  // Determine century based on first digit
  let fullYear;
  if (parseInt(nationalId[0]) >= 0 && parseInt(nationalId[0]) <= 2) {
    fullYear = 2000 + year;
  } else if (parseInt(nationalId[0]) >= 3 && parseInt(nationalId[0]) <= 4) {
    fullYear = 1900 + year;
  } else {
    return null;
  }
  
  return `${fullYear}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
}

// Format National ID for display
function formatMockNationalId(nationalId) {
  if (nationalId.length !== 13) return nationalId;
  return `${nationalId.slice(0, 1)}-${nationalId.slice(1, 5)}-${nationalId.slice(5, 10)}-${nationalId.slice(10, 12)}-${nationalId.slice(12)}`;
}

/**
 * Update validation UI
 */
function updateValidationUI() {
  const input = document.getElementById('nationalId');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('successMessage');
  const extractedInfo = document.getElementById('extractedInfo');
  
  if (!input) return;
  
  // Remove existing classes
  input.classList.remove('border-red-500', 'border-green-500', 'border-yellow-400', 'bg-red-50', 'bg-green-50', 'bg-yellow-50');
  
  // Add appropriate classes based on validation state
  if (validationState.isValidating) {
    input.classList.add('border-yellow-400', 'bg-yellow-50');
  } else if (validationState.isValid === true) {
    input.classList.add('border-green-500', 'bg-green-50');
  } else if (validationState.isValid === false) {
    input.classList.add('border-red-500', 'bg-red-50');
  }
  
  // Update error message
  if (errorMessage) {
    if (validationState.error) {
      errorMessage.textContent = validationState.error;
      errorMessage.style.display = 'block';
    } else {
      errorMessage.style.display = 'none';
    }
  }
  
  // Update success message
  if (successMessage) {
    if (validationState.isValid === true) {
      successMessage.style.display = 'block';
    } else {
      successMessage.style.display = 'none';
    }
  }
  
  // Update extracted information
  if (extractedInfo && validationState.isValid === true && validationState.data) {
    updateExtractedInfo(validationState.data);
  }
  
  // Update criminal record status
  if (validationState.isValid === true && validationState.data?.externalVerification?.details?.criminalRecord) {
    updateCriminalRecordStatus(validationState.data.externalVerification.details);
  }
  
  // Update progress indicator
  updateProgressIndicator();
}

/**
 * Update progress indicator
 */
function updateProgressIndicator() {
  const input = document.getElementById('nationalId');
  const progressDiv = document.getElementById('progressIndicator');
  
  if (!input || !progressDiv) return;
  
  const value = input.value.replace(/\D/g, '');
  
  if (value.length > 0 && value.length < 13) {
    const percentage = (value.length / 13) * 100;
    progressDiv.innerHTML = `
      <div class="mt-1">
        <div class="flex items-center space-x-2">
          <div class="flex-1 bg-gray-200 rounded-full h-2">
            <div class="bg-blue-500 h-2 rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
          </div>
          <span class="text-xs text-gray-500">${value.length}/13</span>
        </div>
      </div>
    `;
    progressDiv.style.display = 'block';
  } else {
    progressDiv.style.display = 'none';
  }
}

/**
 * Update extracted information display
 */
function updateExtractedInfo(data) {
  const extractedInfo = document.getElementById('extractedInfo');
  if (!extractedInfo) return;
  
  let html = '<h4 class="text-sm font-medium text-green-800 mb-2">ข้อมูลจากเลขบัตรประชาชน:</h4>';
  
  // Birth date information
  if (data.extractedInfo?.birthDate) {
    const birthDate = data.extractedInfo.birthDate;
    html += `<div class="text-sm text-green-700 mb-1">
      <p><strong>วันเกิด:</strong> ${birthDate.fullDate}</p>
    </div>`;
  }
  
  // National ID information
  if (data.extractedInfo?.nationalId) {
    const idInfo = data.extractedInfo.nationalId;
    html += `<div class="text-sm text-green-700 mb-1">
      <p><strong>เพศ:</strong> ${idInfo.gender === 'male' ? 'ชาย' : 'หญิง'}</p>
      <p><strong>ลำดับ:</strong> ${idInfo.sequence}</p>
    </div>`;
  }
  
  // Duplicate check warning
  if (data.duplicateCheck?.exists) {
    html += `<div class="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
      ⚠️ เลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว`;
    
    if (data.duplicateCheck.citizenInfo) {
      html += `<div class="mt-1 text-xs">
        <p><strong>ชื่อ:</strong> ${data.duplicateCheck.citizenInfo.firstName} ${data.duplicateCheck.citizenInfo.lastName}</p>
        <p><strong>วันเกิด:</strong> ${data.duplicateCheck.citizenInfo.dateOfBirth}</p>
        <p><strong>เพศ:</strong> ${data.duplicateCheck.citizenInfo.gender}</p>
      </div>`;
    }
    
    html += `</div>`;
  }
  
  extractedInfo.innerHTML = html;
  extractedInfo.style.display = 'block';
}

/**
 * Update criminal record status display
 */
function updateCriminalRecordStatus(verificationDetails) {
  const criminalRecordDiv = document.getElementById('criminalRecordStatus');
  if (!criminalRecordDiv) return;
  
  const criminalRecord = verificationDetails.criminalRecord;
  
  if (criminalRecord.criminal_record) {
    criminalRecordDiv.innerHTML = `
      <div class="mt-2 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-800">
        🚨 <strong>มีประวัติอาชญากรรม</strong>
        <div class="mt-1 text-xs">
          <p>บุคคลนี้มีประวัติอาชญากรรมในระบบ</p>
        </div>
      </div>
    `;
  } else {
    criminalRecordDiv.innerHTML = `
      <div class="mt-2 p-2 bg-green-100 border border-green-300 rounded text-sm text-green-800">
        ✅ <strong>ไม่มีประวัติอาชญากรรม</strong>
        <div class="mt-1 text-xs">
          <p>บุคคลนี้ไม่มีประวัติอาชญากรรมในระบบ</p>
        </div>
      </div>
    `;
  }
  
  criminalRecordDiv.style.display = 'block';
}

/**
 * Handle form submission
 */
function handleFormSubmit(event) {
  const nationalId = document.getElementById('nationalId').value;
  
  if (nationalId.length !== 13) {
    event.preventDefault();
    alert('กรุณากรอกเลขบัตรประชาชน 13 หลัก');
    return;
  }
  
  if (validationState.isValid === false) {
    event.preventDefault();
    alert('เลขบัตรประชาชนไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
    return;
  }
  
  if (validationState.isValidating) {
    event.preventDefault();
    alert('กำลังตรวจสอบเลขบัตรประชาชน กรุณารอสักครู่');
    return;
  }
  
  // Form is valid, allow submission
  console.log('Form submitted with valid National ID:', nationalId);
}

/**
 * Utility function to format National ID
 */
function formatNationalId(nationalId, format = 'dashed') {
  const cleanId = nationalId.replace(/\D/g, '');
  
  if (cleanId.length !== 13) {
    return nationalId;
  }
  
  switch (format) {
    case 'dashed':
      return `${cleanId.slice(0, 1)}-${cleanId.slice(1, 5)}-${cleanId.slice(5, 10)}-${cleanId.slice(10, 12)}-${cleanId.slice(12)}`;
    case 'spaced':
      return `${cleanId.slice(0, 1)} ${cleanId.slice(1, 5)} ${cleanId.slice(5, 10)} ${cleanId.slice(10, 12)} ${cleanId.slice(12)}`;
    default:
      return cleanId;
  }
}

/**
 * Initialize when DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function() {
  initNationalIdValidation();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initNationalIdValidation,
    validateNationalId,
    formatNationalId,
    CONFIG
  };
}
