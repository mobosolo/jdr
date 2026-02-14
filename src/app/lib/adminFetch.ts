const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const ADMIN_TOKEN_KEY = 'jdr_admin_token';

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

export const setAdminToken = (token: string) => {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
};

export const clearAdminToken = () => {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
};

export const adminFetch = async (input: string, init: RequestInit = {}) => {
  const token = getAdminToken();
  const headers = new Headers(init.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return fetch(input.startsWith('http') ? input : `${apiBase}${input}`, {
    ...init,
    headers,
  });
};
