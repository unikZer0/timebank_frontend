

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

  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  // Log response status
  console.log('[apiLogin] Response status:', response.status);

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    const err: any = new Error('Invalid JSON from server');
    err.status = 500;
    console.error('[apiLogin] Invalid JSON from server:', text);
    throw err;
  }

  // Log response body (mask tokens)
  const loggedData = { ...data } as any;
  if (loggedData?.accessToken) loggedData.accessToken = '****TOKEN****';
  if (loggedData?.refreshToken) loggedData.refreshToken = '****TOKEN****';
  console.log('[apiLogin] Response body:', loggedData);

  if (!response.ok) {
    const err: any = new Error(data?.message || 'Request failed');
    err.status = response.status;
    err.data = data;
    console.error('[apiLogin] Error response:', err.status, err.data);
    throw err;
  }

  return data;
}
