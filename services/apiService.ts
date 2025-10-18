

export async function apiLogin(body: { identifier: string; password: string; remember?: boolean; currentLat?: number; currentLon?: number }) {
  // Validate required fields
  if (!body || !body.identifier || !body.password) {
    const err: any = new Error('Missing field');
    err.status = 400;
    throw err;
  }

  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    const err: any = new Error('Invalid JSON from server');
    err.status = 500;
    throw err;
  }

  if (!response.ok) {
    const err: any = new Error(data?.message || 'Request failed');
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}
