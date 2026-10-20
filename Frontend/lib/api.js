import axios from "axios";

import { tokenStorage } from "./tokens";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// A 401 from these endpoints means "wrong credentials", not "expired token"
const NO_REFRESH_URLS = ["/auth/login/", "/auth/register/", "/auth/logout/"];

// AuthContext registers a callback here to react when the session is lost
let onAuthFailure = () => {};
export const setAuthFailureHandler = (handler) => {
  onAuthFailure = handler;
};

async function requestNewTokens() {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) throw new Error("No refresh token");

  // Plain axios, NOT `api`: this call must not go through our own interceptors,
  // or a failing refresh would try to refresh itself forever.
  const { data } = await axios.post(`${API_URL}/auth/refresh/`, { refresh });

  // Rotation is on in the backend: we get a NEW refresh token and the old one
  // is blacklisted, so we must save both.
  tokenStorage.set({ access: data.access, refresh: data.refresh });
  return data.access;
}

// Single-flight: if five requests fail with 401 at once, only ONE refresh runs
// and all five wait for it. Two refreshes with the same refresh token would make
// the second one fail, because the first already blacklisted it.
let refreshPromise = null;
function refreshOnce() {
  if (!refreshPromise) {
    refreshPromise = requestNewTokens().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

// Request interceptor: attach the access token to every request
api.interceptors.request.use((config) => {
  const access = tokenStorage.getAccess();
  if (access) config.headers.Authorization = `Bearer ${access}`;
  return config;
});

// Response interceptor: on a 401, refresh once and retry the original request
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    const shouldTryRefresh =
      status === 401 &&
      original &&
      !original._retry && // never retry the same request twice
      !NO_REFRESH_URLS.some((url) => original.url?.startsWith(url));

    if (!shouldTryRefresh) return Promise.reject(error);

    original._retry = true;
    try {
      const access = await refreshOnce();
      original.headers.Authorization = `Bearer ${access}`;
      return api(original);
    } catch (refreshError) {
      // If the server is just unreachable we keep the tokens, so the user isn't
      // logged out by a bad connection. Any other failure means the session is over.
      const isNetworkError = refreshError.isAxiosError && !refreshError.response;
      if (!isNetworkError) {
        tokenStorage.clear();
        onAuthFailure();
      }
      return Promise.reject(error);
    }
  }
);

export default api;