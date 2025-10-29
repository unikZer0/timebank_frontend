/**
 * Authentication Routes Configuration
 * 
 * Features:
 * - Public endpoint (no authentication required for validation)
 * - National ID validation routes
 * - Input validation middleware
 */

const express = require('express');
const { body, param } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

/**
 * Input validation middleware for National ID
 */
const nationalIdValidation = [
  body('nationalId')
    .notEmpty()
    .withMessage('เลขบัตรประชาชนเป็นข้อมูลที่จำเป็น')
    .isLength({ min: 13, max: 13 })
    .withMessage('เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก')
    .matches(/^\d{13}$/)
    .withMessage('เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น'),
  
  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('รูปแบบวันเกิดไม่ถูกต้อง (ใช้รูปแบบ YYYY-MM-DD)'),
  
  body('checkDuplicates')
    .optional()
    .isBoolean()
    .withMessage('checkDuplicates ต้องเป็น true หรือ false'),
  
  body('verifyExternal')
    .optional()
    .isBoolean()
    .withMessage('verifyExternal ต้องเป็น true หรือ false')
];

/**
 * Input validation for National ID parameter
 */
const nationalIdParamValidation = [
  param('nationalId')
    .notEmpty()
    .withMessage('เลขบัตรประชาชนเป็นข้อมูลที่จำเป็น')
    .isLength({ min: 13, max: 13 })
    .withMessage('เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก')
    .matches(/^\d{13}$/)
    .withMessage('เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น')
];

/**
 * Input validation for batch validation
 */
const batchValidation = [
  body('nationalIds')
    .isArray({ min: 1, max: 100 })
    .withMessage('กรุณาระบุเลขบัตรประชาชนที่ต้องการตรวจสอบ (ไม่เกิน 100 รายการ)'),
  
  body('nationalIds.*')
    .isLength({ min: 13, max: 13 })
    .withMessage('เลขบัตรประชาชนแต่ละรายการต้องเป็นตัวเลข 13 หลัก')
    .matches(/^\d{13}$/)
    .withMessage('เลขบัตรประชาชนแต่ละรายการต้องเป็นตัวเลขเท่านั้น'),
  
  body('options')
    .optional()
    .isObject()
    .withMessage('options ต้องเป็น object'),
  
  body('options.checkDuplicates')
    .optional()
    .isBoolean()
    .withMessage('options.checkDuplicates ต้องเป็น true หรือ false'),
  
  body('options.verifyExternal')
    .optional()
    .isBoolean()
    .withMessage('options.verifyExternal ต้องเป็น true หรือ false')
];

// ===== PUBLIC ROUTES (No Authentication Required) =====

/**
 * POST /api/auth/validate-national-id
 * 
 * Real-time National ID validation endpoint
 * 
 * Request Body:
 * {
 *   "nationalId": "1234567890123",
 *   "birthDate": "1990-01-01", // optional
 *   "checkDuplicates": true,   // optional, default: true
 *   "verifyExternal": false    // optional, default: false
 * }
 * 
 * Response (Success):
 * {
 *   "success": true,
 *   "message": "เลขบัตรประชาชนถูกต้อง",
 *   "data": {
 *     "nationalId": "1234567890123",
 *     "formatted": "1-2345-67890-12-3",
 *     "extractedInfo": {
 *       "birthDate": {
 *         "year": 1990,
 *         "month": 1,
 *         "day": 1,
 *         "fullDate": "1990-01-01",
 *         "isValid": true
 *       },
 *       "nationalId": {
 *         "type": "citizen",
 *         "province": 1,
 *         "sequence": 1234,
 *         "gender": "male",
 *         "isValid": true
 *       }
 *     },
 *     "validation": {
 *       "format": true,
 *       "checksum": true,
 *       "birthDate": true
 *     },
 *     "duplicateCheck": {
 *       "exists": false,
 *       "userId": null,
 *       "registeredAt": null
 *     }
 *   }
 * }
 * 
 * Response (Error):
 * {
 *   "success": false,
 *   "message": "เลขบัตรประชาชนไม่ถูกต้อง",
 *   "code": "INVALID_NATIONAL_ID",
 *   "errors": ["เลขบัตรประชาชนไม่ถูกต้อง (checksum ไม่ผ่าน)"],
 *   "details": {
 *     "format": true,
 *     "checksum": false,
 *     "birthDate": true
 *   }
 * }
 */
router.post('/validate-national-id', 
  nationalIdValidation,
  authController.validateNationalId
);

/**
 * GET /api/auth/national-id-info/:nationalId
 * 
 * Get detailed information about a National ID without validation
 * 
 * URL Parameters:
 * - nationalId: 13-digit National ID
 * 
 * Response (Success):
 * {
 *   "success": true,
 *   "data": {
 *     "nationalId": "1234567890123",
 *     "formatted": "1-2345-67890-12-3",
 *     "birthDate": {
 *       "year": 1990,
 *       "month": 1,
 *       "day": 1,
 *       "fullDate": "1990-01-01",
 *       "isValid": true
 *     },
 *     "nationalIdInfo": {
 *       "type": "citizen",
 *       "province": 1,
 *       "sequence": 1234,
 *       "gender": "male",
 *       "isValid": true
 *     },
 *     "provinceName": "กรุงเทพมหานคร"
 *   }
 * }
 */
router.get('/national-id-info/:nationalId',
  nationalIdParamValidation,
  authController.getNationalIdInfo
);

/**
 * POST /api/auth/validate-national-ids
 * 
 * Batch validate multiple National IDs
 * 
 * Request Body:
 * {
 *   "nationalIds": ["1234567890123", "9876543210987"],
 *   "options": {
 *     "checkDuplicates": true,
 *     "verifyExternal": false
 *   }
 * }
 * 
 * Response (Success):
 * {
 *   "success": true,
 *   "data": {
 *     "results": [
 *       {
 *         "nationalId": "1234567890123",
 *         "isValid": true,
 *         "errors": [],
 *         "extractedInfo": { ... }
 *       },
 *       {
 *         "nationalId": "9876543210987",
 *         "isValid": false,
 *         "errors": ["เลขบัตรประชาชนไม่ถูกต้อง (checksum ไม่ผ่าน)"],
 *         "extractedInfo": null
 *       }
 *     ],
 *     "summary": {
 *       "total": 2,
 *       "valid": 1,
 *       "invalid": 1
 *     }
 *   }
 * }
 */
router.post('/validate-national-ids',
  batchValidation,
  authController.batchValidateNationalIds
);

// ===== AUTHENTICATED ROUTES (Authentication Required) =====
// Add your existing authenticated routes here

/**
 * Example of how to add authentication middleware to routes:
 * 
 * const authenticateToken = require('../middleware/auth');
 * 
 * router.get('/protected-route', authenticateToken, (req, res) => {
 *   // Protected route logic
 * });
 */

module.exports = router;
