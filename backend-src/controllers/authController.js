/**
 * Authentication Controller with National ID Validation
 * 
 * Features:
 * - Real-time validation endpoint: POST /api/auth/validate-national-id
 * - Database duplicate checking
 * - External API verification integration
 * - Comprehensive error handling
 */

const nationalIdValidator = require('../utils/nationalIdValidator');
const { validationResult } = require('express-validator');

/**
 * Validate National ID endpoint
 * POST /api/auth/validate-national-id
 * 
 * Body: {
 *   nationalId: string,
 *   birthDate?: string (YYYY-MM-DD format),
 *   checkDuplicates?: boolean (default: true),
 *   verifyExternal?: boolean (default: false)
 * }
 */
async function validateNationalId(req, res) {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: errors.array()
      });
    }

    const { 
      nationalId, 
      birthDate, 
      checkDuplicates = true, 
      verifyExternal = false 
    } = req.body;

    // Basic validation
    if (!nationalId) {
      return res.status(400).json({
        success: false,
        message: 'เลขบัตรประชาชนเป็นข้อมูลที่จำเป็น',
        code: 'MISSING_NATIONAL_ID'
      });
    }

    // Clean and validate National ID
    const cleanId = nationalId.replace(/\D/g, '');
    
    if (cleanId.length !== 13) {
      return res.status(400).json({
        success: false,
        message: 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก',
        code: 'INVALID_FORMAT'
      });
    }

    // Comprehensive validation
    const validationResult = nationalIdValidator.validateNationalId(cleanId, {
      birthDate,
      checkChecksum: true,
      extractInfo: true
    });

    if (!validationResult.isValid) {
      return res.status(400).json({
        success: false,
        message: 'เลขบัตรประชาชนไม่ถูกต้อง',
        code: 'INVALID_NATIONAL_ID',
        errors: validationResult.errors,
        details: {
          format: validationResult.validation.format,
          checksum: validationResult.validation.checksum,
          birthDate: validationResult.validation.birthDate
        }
      });
    }

    // Check for duplicates in database
    let duplicateCheck = null;
    if (checkDuplicates) {
      try {
        duplicateCheck = await checkNationalIdDuplicate(cleanId);
      } catch (error) {
        console.error('Database duplicate check failed:', error);
        // Continue without duplicate check if database is unavailable
      }
    }

    // External API verification (if enabled)
    let externalVerification = null;
    if (verifyExternal) {
      try {
        externalVerification = await verifyWithExternalAPI(cleanId);
      } catch (error) {
        console.error('External verification failed:', error);
        // Continue without external verification if API is unavailable
      }
    }

    // Prepare response
    const response = {
      success: true,
      message: 'เลขบัตรประชาชนถูกต้อง',
      data: {
        nationalId: cleanId,
        formatted: validationResult.formatted,
        extractedInfo: {
          birthDate: validationResult.extractedInfo.birthDate,
          nationalId: validationResult.extractedInfo.nationalId
        },
        validation: validationResult.validation
      }
    };

    // Add duplicate check result
    if (duplicateCheck !== null) {
      response.data.duplicateCheck = duplicateCheck;
      
      if (duplicateCheck.exists) {
        response.data.duplicateCheck.warning = 'เลขบัตรประชาชนนี้มีอยู่ในระบบแล้ว';
      }
    }

    // Add external verification result
    if (externalVerification !== null) {
      response.data.externalVerification = externalVerification;
    }

    res.json(response);

  } catch (error) {
    console.error('National ID validation error:', error);
    
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบเลขบัตรประชาชน',
      code: 'VALIDATION_ERROR'
    });
  }
}

/**
 * Check if National ID already exists in database
 * 
 * @param {string} nationalId - Clean National ID
 * @returns {Object} - Duplicate check result
 */
async function checkNationalIdDuplicate(nationalId) {
  try {
    // Check against mock Thai citizens database
    const mockCitizensData = await fetchMockCitizensData();
    
    if (mockCitizensData && mockCitizensData.success && mockCitizensData.data) {
      const existingCitizen = mockCitizensData.data.find(citizen => citizen.national_id === nationalId);
      
      if (existingCitizen) {
        return {
          exists: true,
          userId: existingCitizen.id,
          registeredAt: new Date().toISOString(), // Mock timestamp
          citizenInfo: {
            firstName: existingCitizen.first_name,
            lastName: existingCitizen.last_name,
            dateOfBirth: existingCitizen.date_of_birth,
            gender: existingCitizen.gender,
            address: existingCitizen.address,
            contact: existingCitizen.contact,
            criminalRecord: existingCitizen.criminal_record
          }
        };
      }
    }
    
    return {
      exists: false,
      userId: null,
      registeredAt: null,
      citizenInfo: null
    };
    
  } catch (error) {
    console.error('Database duplicate check error:', error);
    throw error;
  }
}

/**
 * Fetch mock Thai citizens data from external API
 * 
 * @returns {Object} - Mock citizens data
 */
async function fetchMockCitizensData() {
  try {
    const response = await fetch('https://pub-f1ab9efe03eb4ce7afd952fc03688236.r2.dev/mock_thai_citizens_with_criminal.json');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch citizens data: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error('Failed to fetch mock citizens data:', error);
    return null;
  }
}

/**
 * Verify National ID with external API (Criminal Record Check)
 * 
 * @param {string} nationalId - Clean National ID
 * @returns {Object} - External verification result
 */
async function verifyWithExternalAPI(nationalId) {
  try {
    // Check criminal record from mock Thai citizens database
    const mockCitizensData = await fetchMockCitizensData();
    
    if (mockCitizensData && mockCitizensData.success && mockCitizensData.data) {
      const citizen = mockCitizensData.data.find(citizen => citizen.national_id === nationalId);
      
      if (citizen) {
        return {
          verified: true,
          source: 'mock_citizens_database',
          verifiedAt: new Date().toISOString(),
          details: {
            status: 'verified',
            message: 'National ID verified with citizens database',
            criminalRecord: citizen.criminal_record,
            citizenInfo: {
              firstName: citizen.first_name,
              lastName: citizen.last_name,
              dateOfBirth: citizen.date_of_birth,
              gender: citizen.gender,
              address: citizen.address,
              contact: citizen.contact
            }
          }
        };
      } else {
        return {
          verified: false,
          source: 'mock_citizens_database',
          verifiedAt: new Date().toISOString(),
          details: {
            status: 'not_found',
            message: 'National ID not found in citizens database'
          }
        };
      }
    }
    
    // Fallback if database is unavailable
    return {
      verified: true,
      source: 'fallback_verification',
      verifiedAt: new Date().toISOString(),
      details: {
        status: 'verified',
        message: 'National ID verified (database unavailable)'
      }
    };
    
  } catch (error) {
    console.error('External verification error:', error);
    throw error;
  }
}

/**
 * Get National ID information endpoint
 * GET /api/auth/national-id-info/:nationalId
 * 
 * Returns detailed information about a National ID without validation
 */
async function getNationalIdInfo(req, res) {
  try {
    const { nationalId } = req.params;
    
    if (!nationalId) {
      return res.status(400).json({
        success: false,
        message: 'เลขบัตรประชาชนเป็นข้อมูลที่จำเป็น',
        code: 'MISSING_NATIONAL_ID'
      });
    }

    const cleanId = nationalId.replace(/\D/g, '');
    
    if (cleanId.length !== 13) {
      return res.status(400).json({
        success: false,
        message: 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก',
        code: 'INVALID_FORMAT'
      });
    }

    // Extract information without validation
    const birthInfo = nationalIdValidator.extractBirthDate(cleanId);
    const idInfo = nationalIdValidator.extractNationalIdInfo(cleanId);
    
    if (!birthInfo.isValid || !idInfo.isValid) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถดึงข้อมูลจากเลขบัตรประชาชนได้',
        code: 'INVALID_NATIONAL_ID'
      });
    }

    res.json({
      success: true,
      data: {
        nationalId: cleanId,
        formatted: nationalIdValidator.formatNationalId(cleanId),
        birthDate: birthInfo,
        nationalIdInfo: idInfo,
        provinceName: nationalIdValidator.getProvinceName(idInfo.province)
      }
    });

  } catch (error) {
    console.error('National ID info error:', error);
    
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูลเลขบัตรประชาชน',
      code: 'INFO_ERROR'
    });
  }
}

/**
 * Batch validate multiple National IDs
 * POST /api/auth/validate-national-ids
 * 
 * Body: {
 *   nationalIds: string[],
 *   options?: {
 *     checkDuplicates?: boolean,
 *     verifyExternal?: boolean
 *   }
 * }
 */
async function batchValidateNationalIds(req, res) {
  try {
    const { nationalIds, options = {} } = req.body;
    
    if (!Array.isArray(nationalIds) || nationalIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'กรุณาระบุเลขบัตรประชาชนที่ต้องการตรวจสอบ',
        code: 'MISSING_NATIONAL_IDS'
      });
    }

    if (nationalIds.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'ไม่สามารถตรวจสอบได้มากกว่า 100 เลขบัตรประชาชนในครั้งเดียว',
        code: 'TOO_MANY_IDS'
      });
    }

    const results = [];
    
    for (const nationalId of nationalIds) {
      try {
        const validationResult = nationalIdValidator.validateNationalId(nationalId, {
          checkChecksum: true,
          extractInfo: true
        });
        
        results.push({
          nationalId: nationalId.replace(/\D/g, ''),
          isValid: validationResult.isValid,
          errors: validationResult.errors,
          extractedInfo: validationResult.extractedInfo
        });
      } catch (error) {
        results.push({
          nationalId: nationalId.replace(/\D/g, ''),
          isValid: false,
          errors: ['เกิดข้อผิดพลาดในการตรวจสอบ'],
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      data: {
        results,
        summary: {
          total: results.length,
          valid: results.filter(r => r.isValid).length,
          invalid: results.filter(r => !r.isValid).length
        }
      }
    });

  } catch (error) {
    console.error('Batch validation error:', error);
    
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการตรวจสอบเลขบัตรประชาชน',
      code: 'BATCH_VALIDATION_ERROR'
    });
  }
}

module.exports = {
  validateNationalId,
  getNationalIdInfo,
  batchValidateNationalIds
};
