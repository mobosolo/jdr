const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

let csrfToken: string | null = null;

export const getCsrfToken = async () => {
  if (csrfToken) return csrfToken;
  const response = await fetch(`${apiBase}/api/admin/csrf`, { credentials: 'include' });
  if (!response.ok) {
    throw new Error(`CSRF error: ${response.status}`);
  }
  const data = await response.json();
  csrfToken = data.csrfToken;
  return csrfToken;
};

export const adminFetch = async (input: string, init: RequestInit = {}) => {
  const token = await getCsrfToken();
  const headers = new Headers(init.headers);
  headers.set('x-csrf-token', token);
  return fetch(input, { ...init, headers, credentials: 'include' });
};
