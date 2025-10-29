// API Service for TimeBank Frontend
// This file contains all API calls to the backend

const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('accessToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function to handle API responses
const handleApiResponse = async (response: Response) => {
  const text = await response.text();
  let data;
  
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    const err: any = new Error('Invalid JSON from server');
    err.status = 500;
    console.error('Invalid JSON from server:', text);
    throw err;
  }

  if (!response.ok) {
    const err: any = new Error(data?.message || 'Request failed');
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
};

// Authentication APIs
export async function apiLogin(body: { identifier: string; password: string; remember?: boolean; currentLat?: number; currentLon?: number }) {
  // Validate required fields
  if (!body || !body.identifier || !body.password) {
    const err: any = new Error('Missing field');
    err.status = 400;
    throw err;
  }

  // Log request (mask password)
  const masked = { ...body, password: body.password ? '*****' : body.password };
  console.log('[apiLogin] Request payload:', masked);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  // Log response status
  console.log('[apiLogin] Response status:', response.status);

  const data = await handleApiResponse(response);

  // Log response body (mask tokens)
  const loggedData = { ...data } as any;
  if (loggedData?.accessToken) loggedData.accessToken = '****TOKEN****';
  if (loggedData?.refreshToken) loggedData.refreshToken = '****TOKEN****';
  console.log('[apiLogin] Response body:', loggedData);

  return data;
}

export async function apiRegister(body: any) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return handleApiResponse(response);
}

export async function apiLogout() {
  const response = await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
}

// Wallet APIs
export async function getWalletBalance() {
  const response = await fetch(`${API_BASE_URL}/wallet/balance`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
}

// User Profile APIs
export async function getUserProfile() {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
}

export async function updateUserProfile(profileData: { 
  skills?: string[];
  phone?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });

  return handleApiResponse(response);
}

export async function getAllUserSkills() {
  const response = await fetch(`${API_BASE_URL}/auth/skills`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
}

// Job APIs
export async function getJobs(limit = 50, offset = 0) {
  const response = await fetch(`${API_BASE_URL}/jobs?limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
}

export async function getJobById(jobId: number) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
}

export async function getJobsByUser() {
  const response = await fetch(`${API_BASE_URL}/jobs/user/my-jobs`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
}

export async function createJob(body: {
  title: string;
  description: string;
  required_skills?: string[];
  time_balance_hours: number;
  start_time?: string;
  end_time?: string;
  location_lat?: number;
  location_lon?: number;
}) {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  return handleApiResponse(response);
}

export async function updateJob(jobId: number, body: {
  title?: string;
  description?: string;
  required_skills?: string[];
  time_balance_hours?: number;
  start_time?: string;
  end_time?: string;
  location_lat?: number;
  location_lon?: number;
}) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  return handleApiResponse(response);
}

export async function deleteJob(jobId: number) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
}

export async function broadcastJob(jobId: number) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/broadcast`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
}

export async function applyToJob(jobId: number) {
  const response = await fetch(`${API_BASE_URL}/job-applications`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ jobId }),
  });

  return handleApiResponse(response);
}

// Job Application APIs
export async function getJobApplications(jobId: number) {
  const response = await fetch(`${API_BASE_URL}/jobs/${jobId}/applications`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
}

export async function updateJobApplicationStatus(applicationId: number, status: string, employerId?: number) {
  const response = await fetch(`${API_BASE_URL}/jobapp/${applicationId}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, employerId }),
  });

  return handleApiResponse(response);
}

export async function getMyJobApplications() {
  const response = await fetch(`${API_BASE_URL}/jobapp/user/me`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
}

// Transaction APIs
export async function getUserTransactions(limit = 50, offset = 0) {
  const response = await fetch(`${API_BASE_URL}/transactions?limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
}

// Transfer APIs
export async function transferCredits(toUserId: number, amount: number) {
  const response = await fetch(`${API_BASE_URL}/transfer`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ toUserId, hours: amount }), // Backend expects 'hours' not 'amount'
  });

  return handleApiResponse(response);
}

export async function getTransferHistory(limit = 50, offset = 0) {
  const response = await fetch(`${API_BASE_URL}/transfer/history?limit=${limit}&offset=${offset}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
}

export async function getFamilyMembers() {
  const response = await fetch(`${API_BASE_URL}/transfer/family`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const result = await handleApiResponse(response);
  
  // Transform the response to match frontend expectations
  if (result.success && result.data) {
    return {
      ...result,
      familyMembers: result.data.map((member: any) => ({
        id: member.id,
        first_name: member.first_name,
        last_name: member.last_name,
        email: member.email,
        id_card_number: '', // Not provided by backend
        avatar_url: `https://i.pravatar.cc/150?u=${member.email}`
      }))
    };
  }
  
  return result;
}

// User Search API
export async function searchUserByIdCard(searchTerm: string) {
  const response = await fetch(`${API_BASE_URL}/auth/search-by-id-card?search=${encodeURIComponent(searchTerm)}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  const result = await handleApiResponse(response);
  
  // Transform the response to match frontend expectations
  if (result.success && result.users) {
    return {
      ...result,
      users: result.users.map((user: any) => ({
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        national_id: user.national_id,
        household: user.household,
        avatar_url: `https://i.pravatar.cc/150?u=${user.email}`
      }))
    };
  }
  
  return result;
}

// Transfer APIs
export async function getTransfers() {
  const response = await fetch(`${API_BASE_URL}/transfers`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
}

export async function createTransfer(body: any) {
  const response = await fetch(`${API_BASE_URL}/transfers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(body),
  });

  return handleApiResponse(response);
}

// Notification APIs
export async function getNotifications() {
  const response = await fetch(`${API_BASE_URL}/notifications`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
}

export async function markNotificationAsRead(notificationId: number) {
  const response = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  return handleApiResponse(response);
}

// National ID Validation APIs
export async function validateNationalId(body: {
  nationalId: string;
  birthDate?: string;
  checkDuplicates?: boolean;
  verifyExternal?: boolean;
}) {
  try {
    // Convert frontend format to backend format
    const backendBody = {
      national_id: body.nationalId, // Backend expects 'national_id' not 'nationalId'
      birth_date: body.birthDate,   // Backend expects 'birth_date' not 'birthDate'
      check_duplicates: body.checkDuplicates,
      verify_external: body.verifyExternal
    };

    console.log('Sending request to backend:', backendBody);

    const response = await fetch(`${API_BASE_URL}/auth/validate-national-id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendBody),
    });

    console.log('Backend response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend error response:', errorText);
      throw new Error(`Backend error: ${response.status} - ${errorText}`);
    }

    const result = await handleApiResponse(response);
    console.log('Backend response:', result);
    
    // Convert backend response format to frontend format
    const convertedResult = convertBackendResponseToFrontend(result);
    console.log('Converted result:', convertedResult);
    return convertedResult;
  } catch (error) {
    // Fallback to mock validation if backend is not available
    console.warn('Backend not available, using mock validation:', error);
    return mockValidateNationalId(body);
  }
}

// Mock validation function for offline testing
async function mockValidateNationalId(body: {
  nationalId: string;
  birthDate?: string;
  checkDuplicates?: boolean;
  verifyExternal?: boolean;
}) {
  const { nationalId, birthDate, checkDuplicates = true, verifyExternal = false } = body;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Basic format validation
  if (!nationalId || nationalId.length !== 13 || !/^\d{13}$/.test(nationalId)) {
    return {
      success: false,
      message: 'เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก',
      code: 'INVALID_FORMAT'
    };
  }
  
  // Check if National ID is already in use in database
  console.log('Starting database check for National ID:', nationalId);
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
  
  // Check birth date match if provided
  let birthDateMatch = true;
  if (birthDate && extractedBirthDate) {
    birthDateMatch = birthDate === extractedBirthDate;
  }
  
  if (!birthDateMatch) {
    return {
      success: false,
      message: 'วันเกิดไม่ตรงกับเลขบัตรประชาชน',
      code: 'BIRTH_DATE_MISMATCH'
    };
  }
  
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
        birthDate: birthDateMatch
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
      externalVerification: verifyExternal ? {
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
      } : null
    }
  };
}

// Mock checksum validation (simplified version)
function validateMockChecksum(nationalId: string): boolean {
  // Simple validation - in real implementation, use proper Thai National ID algorithm
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
async function mockLookupCitizen(nationalId: string) {
  try {
    console.log('Looking up National ID in database:', nationalId);
    const response = await fetch('https://pub-f1ab9efe03eb4ce7afd952fc03688236.r2.dev/mock_thai_citizens_with_criminal.json');
    const data = await response.json();
    
    console.log('Database response:', data);
    
    if (data.success && data.data) {
      const foundCitizen = data.data.find((citizen: any) => citizen.national_id === nationalId);
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
function extractMockBirthDate(nationalId: string): string | null {
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
function formatMockNationalId(nationalId: string): string {
  if (nationalId.length !== 13) return nationalId;
  return `${nationalId.slice(0, 1)}-${nationalId.slice(1, 5)}-${nationalId.slice(5, 10)}-${nationalId.slice(10, 12)}-${nationalId.slice(12)}`;
}

// Convert backend response format to frontend format
function convertBackendResponseToFrontend(backendResponse: any) {
  // Backend response format (from your Postman test):
  // {
  //   "success": true,
  //   "message": "Valid National ID (found in verification system)",
  //   "nationalId": "1000000000015",
  //   "formattedId": "1-0000-00000-01-5",
  //   "idInfo": { ... },
  //   "validationDetails": { ... }
  // }

  if (!backendResponse.success) {
    // Check if it's a duplicate error (National ID found in verification system)
    if (backendResponse.validationDetails?.inVerificationSystem || 
        backendResponse.message?.includes('มีอยู่ในระบบแล้ว') ||
        backendResponse.message?.includes('มีผู้ใช้งานแล้ว')) {
      console.log('Backend detected National ID in verification system');
      return {
        success: false,
        message: 'เลขบัตรประชาชนนี้มีผู้ใช้งานแล้ว',
        code: 'DUPLICATE_NATIONAL_ID'
      };
    }
    
    console.log('Backend validation failed:', backendResponse.message);
    return {
      success: false,
      message: backendResponse.message || 'เลขบัตรประชาชนไม่ถูกต้อง',
      code: 'INVALID_NATIONAL_ID'
    };
  }

  // Convert successful response
  return {
    success: true,
    message: backendResponse.message || 'เลขบัตรประชาชนถูกต้อง',
    data: {
      nationalId: backendResponse.nationalId,
      formatted: backendResponse.formattedId,
      extractedInfo: {
        birthDate: {
          year: backendResponse.idInfo?.birthYear || 0,
          month: backendResponse.idInfo?.birthMonth || 0,
          day: backendResponse.idInfo?.birthDay || 0,
          fullDate: backendResponse.idInfo?.birthDate || '',
          isValid: true
        },
        nationalId: {
          type: backendResponse.idInfo?.type || 'citizen',
          province: parseInt(backendResponse.idInfo?.province || '0'),
          sequence: parseInt(backendResponse.idInfo?.sequence || '0'),
          gender: backendResponse.idInfo?.type?.includes('male') ? 'male' : 'female',
          isValid: true
        }
      },
      validation: {
        format: true,
        checksum: backendResponse.validationDetails?.checksumValid || false,
        birthDate: true
      },
      duplicateCheck: {
        exists: backendResponse.validationDetails?.inVerificationSystem || false,
        userId: null,
        registeredAt: null,
        citizenInfo: null
      },
      externalVerification: {
        verified: backendResponse.validationDetails?.inVerificationSystem || false,
        source: 'backend_api',
        verifiedAt: new Date().toISOString(),
        details: {
          status: backendResponse.validationDetails?.inVerificationSystem ? 'verified' : 'not_found',
          message: backendResponse.message,
          criminalRecord: { criminal_record: false, record_details: [] },
          citizenInfo: null
        }
      }
    }
  };
}

export async function getNationalIdInfo(nationalId: string) {
  const response = await fetch(`${API_BASE_URL}/auth/national-id-info/${nationalId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  return handleApiResponse(response);
}

export async function batchValidateNationalIds(body: {
  nationalIds: string[];
  options?: {
    checkDuplicates?: boolean;
    verifyExternal?: boolean;
  };
}) {
  const response = await fetch(`${API_BASE_URL}/auth/validate-national-ids`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  return handleApiResponse(response);
}






