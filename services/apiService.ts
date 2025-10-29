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



