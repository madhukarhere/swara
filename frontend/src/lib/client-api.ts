// Browser-side API helper. Uses relative URLs (same-origin via the Next proxy)
// so cookies flow automatically; attaches the double-submit CSRF token on writes.

export interface ApiResult<T = unknown> {
  ok: boolean;
  status: number;
  body: T;
}

let csrfToken: string | null = null;

async function getCsrf(): Promise<string> {
  if (csrfToken) return csrfToken;
  const r = await fetch('/api/admin/csrf', { credentials: 'include' });
  const j = await r.json();
  csrfToken = j.csrfToken as string;
  return csrfToken;
}

export function resetCsrf(): void {
  csrfToken = null;
}

async function parse<T>(res: Response): Promise<ApiResult<T>> {
  const text = await res.text();
  const body = text ? JSON.parse(text) : {};
  return { ok: res.ok, status: res.status, body: body as T };
}

export async function apiJson<T = unknown>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
  body?: unknown,
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = {};
  const init: RequestInit = { method, credentials: 'include', headers };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }
  if (method !== 'GET') headers['X-CSRF-Token'] = await getCsrf();
  return parse<T>(await fetch(path, init));
}

export async function apiForm<T = unknown>(
  path: string,
  method: 'POST' | 'PUT',
  form: FormData,
): Promise<ApiResult<T>> {
  const headers: Record<string, string> = { 'X-CSRF-Token': await getCsrf() };
  return parse<T>(await fetch(path, { method, credentials: 'include', headers, body: form }));
}

export const adminLogin = (username: string, password: string) =>
  apiJson<{ admin?: { username: string }; error?: string }>('/api/admin/login', 'POST', { username, password });
export const adminLogout = () => apiJson('/api/admin/logout', 'POST');
export const adminMe = () =>
  apiJson<{ admin?: { id: string; username: string; email: string; role: string; lastLoginAt?: string | null } }>('/api/admin/me');
