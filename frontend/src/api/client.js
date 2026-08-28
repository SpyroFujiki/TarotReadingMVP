import { env } from "../config/env";

const TOKEN_KEY = "tarot_access_token";

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem("tarot_user");
  },
  getUser: () => {
    const user = localStorage.getItem("tarot_user");
    return user ? JSON.parse(user) : null;
  },
  setUser: (user) => localStorage.setItem("tarot_user", JSON.stringify(user)),
};

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const token = authStorage.getToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Tự động xử lý khi Token hết hạn hoặc không hợp lệ
    if (response.status === 401) {
      authStorage.clear();
    }
    const error = new Error(payload.detail || `Lỗi yêu cầu (${response.status})`);
    error.status = response.status;
    error.detail = payload.detail;
    throw error;
  }

  return payload;
}

export const api = {
  get: (path) => apiRequest(path, { method: "GET" }),
  post: (path, body) =>
    apiRequest(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: (path, body) =>
    apiRequest(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: (path, body) =>
    apiRequest(path, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: (path) => apiRequest(path, { method: "DELETE" }),
};