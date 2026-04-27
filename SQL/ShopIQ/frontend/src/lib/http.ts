import { getCsrfTokenFromCookie } from "./utils";

const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;
  payload?: unknown;

  constructor(status: number, message: string, payload?: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

async function doRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  const method = (init.method ?? "GET").toUpperCase();

  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = getCsrfTokenFromCookie();
    if (csrfToken) headers.set("x-csrf-token", csrfToken);
  }

  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    ...init,
    headers
  });

  if (response.status === 401 && retry && !path.startsWith("/auth/refresh")) {
    const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include"
    });
    if (refreshResponse.ok) {
      return doRequest<T>(path, init, false);
    }
  }

  const payload = (await response.json().catch(() => null)) as {
    success?: boolean;
    message?: string;
    data?: T;
  } | null;

  if (!response.ok) throw new ApiError(response.status, payload?.message ?? "Request failed.", payload);
  return (payload?.data ?? payload) as T;
}

export const api = {
  get: <T>(path: string) => doRequest<T>(path),
  post: <T>(path: string, body?: unknown) =>
    doRequest<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    doRequest<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined })
};
