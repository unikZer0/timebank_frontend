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
        avatar_url: `https://i.pravatar.cc/150?u=${member.email}`,
        household: member.household
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

// Public dataset: relations by national id (demo only)
export async function getPersonRelationsByNationalId(nationalId: string) {
  const url = 'https://pub-f1ab9efe03eb4ce7afd952fc03688236.r2.dev/people_with_relations.json';
  const response = await fetch(url, { method: 'GET' });
  const data = await handleApiResponse(response);

  if (!data?.success || !Array.isArray(data?.data)) {
    return { success: false, message: 'Invalid relations dataset' };
  }

  const people = data.data as any[];
  const me = people.find(p => p.national_id === nationalId);
  if (!me) return { success: false, message: 'Person not found in dataset' };

  // helper to map ids to simple person objects
  const pick = (p: any) => ({
    id: p.id,
    first_name: p.first_name,
    last_name: p.last_name,
    national_id: p.national_id,
    family_id: p.family_id,
  });

  const byId = new Map<number, any>(people.map(p => [p.id, p]));
  const rel = me.relations || {};

  const mapIds = (ids: number[]) => ids
    .map((id: number) => byId.get(id))
    .filter(Boolean)
    .map(pick);

  const result = {
    success: true,
    person: pick(me),
    family_id: me.family_id,
    parents: [me.parents?.father_id, me.parents?.mother_id]
      .filter((id: number | null) => id)
      .map((id: number) => byId.get(id))
      .filter(Boolean)
      .map(pick),
    children: mapIds(rel.children || []),
    siblings: mapIds(rel.siblings || []),
    grandparents: {
      paternal: mapIds((rel.grandparents?.paternal) || []),
      maternal: mapIds((rel.grandparents?.maternal) || []),
    },
  };

  return result;
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

export function getRelationshipBetween(a: any, b: any): string {
  // parent -> child
  if (b.parents?.father_id === a.id || b.parents?.mother_id === a.id) {
    return a.gender === "ชาย" ? "father" : "mother";
  }

  if (a.parents?.father_id === b.id || a.parents?.mother_id === b.id) {
    return b.gender === "ชาย" ? "father of A" : "mother of A";
  }

  // siblings
  if (
    a.parents?.father_id &&
    a.parents?.father_id === b.parents?.father_id &&
    a.parents?.mother_id &&
    a.parents?.mother_id === b.parents?.mother_id &&
    a.id !== b.id
  ) {
    return "siblings";
  }

  // grandparent
  const aDad = a.parents?.father_id;
  const aMom = a.parents?.mother_id;

  if (aDad === b.parents?.father_id || aDad === b.parents?.mother_id) {
    return "uncle/aunt (paternal)";
  }

  if (aMom === b.parents?.father_id || aMom === b.parents?.mother_id) {
    return "uncle/aunt (maternal)";
  }

  // check if b is uncle of a
  const bDad = b.parents?.father_id;
  const bMom = b.parents?.mother_id;

  if (bDad === a.parents?.father_id || bDad === a.parents?.mother_id) {
    return "nephew/niece (paternal)";
  }

  if (bMom === a.parents?.father_id || bMom === a.parents?.mother_id) {
    return "nephew/niece (maternal)";
  }

  // grandparent → child
  if (aDad === b.id || aMom === b.id) {
    return "grandparent";
  }

  if (bDad === a.id || bMom === a.id) {
    return "grandparent of B";
  }

  return "no direct relation";
}
export function getRelationBetween(me: any, target: any): string {
  if (!me || !target) return "-";

  // father/mother
  if (target.parents?.father_id === me.id) return "Father";
  if (target.parents?.mother_id === me.id) return "Mother";

  // child
  if (me.parents?.father_id === target.id) return "Child (Father)";
  if (me.parents?.mother_id === target.id) return "Child (Mother)";

  // siblings
  if (
    me.parents?.father_id &&
    me.parents.father_id === target.parents?.father_id &&
    me.parents?.mother_id &&
    me.parents.mother_id === target.parents?.mother_id &&
    me.id !== target.id
  ) {
    return "Sibling";
  }

  // uncle/aunt
  if (target.relations?.uncles_aunts?.paternal?.includes(me.id)) return "Uncle/Aunt (Paternal)";
  if (target.relations?.uncles_aunts?.maternal?.includes(me.id)) return "Uncle/Aunt (Maternal)";

  // nephew/niece
  if (target.relations?.nephews_nieces?.includes(me.id)) return "Nephew/Niece";

  return "-";
}


