/**
 * Thai National ID Validation Component
 * 
 * Features:
 * - Real-time validation as user types
 * - Debounced API calls (500ms delay)
 * - Visual feedback (green/red borders, messages)
 * - Input restrictions (numbers only)
 * - Auto-formatting options
 * - Error message customization
 */

import React, { useState, useEffect, useCallback } from 'react';
import { validateNationalId } from '../services/apiService';

interface NationalIdValidationProps {
  value: string;
  onChange: (value: string) => void;
  onValidationChange?: (isValid: boolean, data?: any) => void;
  birthDate?: string;
  checkDuplicates?: boolean;
  verifyExternal?: boolean;
  showFormatted?: boolean;
  showExtractedInfo?: boolean;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

interface ValidationState {
  isValid: boolean | null;
  isValidating: boolean;
  error: string | null;
  data: any;
  formatted: string | null;
}

export const NationalIdValidation: React.FC<NationalIdValidationProps> = ({
  value,
  onChange,
  onValidationChange,
  birthDate,
  checkDuplicates = true,
  verifyExternal = false,
  showFormatted = true,
  showExtractedInfo = true,
  className = '',
  placeholder = '1234567890123',
  disabled = false,
  required = false
}) => {
  const [validationState, setValidationState] = useState<ValidationState>({
    isValid: null,
    isValidating: false,
    error: null,
    data: null,
    formatted: null
  });

  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  // Debounced validation function
  const debouncedValidate = useCallback(
    (nationalId: string) => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const timer = setTimeout(async () => {
        // Validate for any length > 0, not just 13 digits
        if (nationalId.length > 0) {
          await validateNationalIdValue(nationalId);
        } else {
          setValidationState({
            isValid: null,
            isValidating: false,
            error: null,
            data: null,
            formatted: null
          });
          onValidationChange?.(false);
        }
      }, 300); // Reduced debounce time for more responsive feel

      setDebounceTimer(timer);
    },
    [birthDate, checkDuplicates, verifyExternal, onValidationChange]
  );

  // Validation function with progressive feedback
  const validateNationalIdValue = async (nationalId: string) => {
    setValidationState(prev => ({ ...prev, isValidating: true, error: null }));

    try {
      // First, do basic format validation
      if (nationalId.length < 13) {
        setValidationState({
          isValid: null,
          isValidating: false,
          error: `กรุณากรอกเลขบัตรประชาชนให้ครบ 13 หลัก (เหลืออีก ${13 - nationalId.length} หลัก)`,
          data: null,
          formatted: null
        });
        onValidationChange?.(false);
        return;
      }

      if (!/^\d{13}$/.test(nationalId)) {
        setValidationState({
          isValid: false,
          isValidating: false,
          error: 'เลขบัตรประชาชนต้องเป็นตัวเลขเท่านั้น',
          data: null,
          formatted: null
        });
        onValidationChange?.(false);
        return;
      }

      // Now do full validation for complete 13-digit IDs
      const response = await validateNationalId({
        nationalId,
        birthDate,
        checkDuplicates,
        verifyExternal
      });

      console.log('Validation response:', response);

      if (response.success) {
        setValidationState({
          isValid: true,
          isValidating: false,
          error: null,
          data: response.data,
          formatted: response.data.formatted
        });
        onValidationChange?.(true, response.data);
      } else {
        console.log('Validation failed:', response.message);
        setValidationState({
          isValid: false,
          isValidating: false,
          error: response.message || 'เลขบัตรประชาชนไม่ถูกต้อง',
          data: response.data,
          formatted: null
        });
        onValidationChange?.(false, response.data);
      }
    } catch (error: any) {
      const errorMessage = error?.data?.message || error?.message || 'เกิดข้อผิดพลาดในการตรวจสอบ';
      setValidationState({
        isValid: false,
        isValidating: false,
        error: errorMessage,
        data: null,
        formatted: null
      });
      onValidationChange?.(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Only allow numbers
    const numericValue = inputValue.replace(/\D/g, '');
    
    // Limit to 13 digits
    const limitedValue = numericValue.slice(0, 13);
    
    onChange(limitedValue);
    
    // Trigger debounced validation
    debouncedValidate(limitedValue);
  };

  // Handle input blur
  const handleInputBlur = () => {
    if (value.length > 0) {
      validateNationalIdValue(value);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  // Get input classes based on validation state
  const getInputClasses = () => {
    const baseClasses = 'w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors';
    
    if (validationState.isValidating) {
      return `${baseClasses} border-yellow-400 bg-yellow-50`;
    } else if (validationState.isValid === true) {
      return `${baseClasses} border-green-500 bg-green-50`;
    } else if (validationState.isValid === false) {
      return `${baseClasses} border-red-500 bg-red-50`;
    } else {
      return `${baseClasses} border-gray-300`;
    }
  };

  // Format display value
  const getDisplayValue = () => {
    if (showFormatted && validationState.formatted && validationState.isValid) {
      return validationState.formatted;
    }
    return value;
  };

  return (
    <div className={`national-id-validation ${className}`}>
      {/* Input Field */}
      <div className="relative">
        <input
          type="text"
          value={getDisplayValue()}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={getInputClasses()}
          maxLength={13}
        />
        
        {/* Loading Indicator */}
        {validationState.isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Success Indicator */}
        {validationState.isValid === true && !validationState.isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* Error Indicator */}
        {validationState.isValid === false && !validationState.isValidating && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Error Message */}
      {validationState.error && (
        <div className="mt-1 text-sm text-red-600">
          {validationState.error}
        </div>
      )}

      {/* Success Message */}
      {validationState.isValid === true && validationState.data && (
        <div className="mt-1 text-sm text-green-600">
          ✓ เลขบัตรประชาชนถูกต้อง
        </div>
      )}

      {/* Progress Indicator */}
      {value.length > 0 && value.length < 13 && (
        <div className="mt-1">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(value.length / 13) * 100}%` }}
              ></div>
            </div>
            <span className="text-xs text-gray-500">{value.length}/13</span>
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="mt-1 text-xs text-gray-500">
        กรอกเลขบัตรประชาชน 13 หลัก (เฉพาะตัวเลข) - ระบบจะตรวจสอบแบบเรียลไทม์
      </div>
    </div>
  );
};

export default NationalIdValidation;
