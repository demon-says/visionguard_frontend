// src/app/api/apiClient.ts
// ─────────────────────────────────────────────────────────────
// Central API client for Vision Guard.
// All pages use this to talk to the Express backend.
//
// In development, requests go through the Vite proxy (/api → localhost:5000).
// In production, set VITE_API_BASE_URL to the deployed backend URL.
// ─────────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export class ApiError extends Error {
  status: number;
  code: string;

  constructor(status: number, message: string, code: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function buildQuery(params?: Record<string, unknown>): string {
  if (!params) return '';
  const entries = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '' && v !== 'all')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return entries.length ? `?${entries.join('&')}` : '';
}

async function request<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  const url = `${API_BASE}${path}`;

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // Attempt to parse JSON even on error responses
  let json: any;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(res.status, 'Invalid JSON response from server', 'PARSE_ERROR');
  }

  if (!res.ok || json.success === false) {
    throw new ApiError(
      res.status,
      json.error || `Request failed with status ${res.status}`,
      json.code || 'UNKNOWN_ERROR',
    );
  }

  return json as T;
}

export const api = {
  get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    return request<T>('GET', path + buildQuery(params));
  },

  post<T>(path: string, body?: unknown): Promise<T> {
    return request<T>('POST', path, body);
  },

  put<T>(path: string, body: unknown): Promise<T> {
    return request<T>('PUT', path, body);
  },

  patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>('PATCH', path, body);
  },
};
