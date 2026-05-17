/**
 * Axios instance pre-configured for the application.
 *
 * - Reads the JWT from the js-cookie access_token on every request
 *   and attaches it as an Authorization header.
 * - Intercepts 401 responses to clear local auth state and redirect
 *   the user to the login page.
 *
 * When you deploy, set VITE_API_BASE_URL in .env to point at your server.
 * In development the Vite proxy forwards /api → http://localhost:5000.
 */

import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { getTokenCookie, removeTokenCookie } from "@/lib/cookies";
import { verifyToken } from "@/lib/jwt";
import { useAuthStore } from "@/store/auth-store";
import type { ApiError } from "@/types";

/** Create a shared axios instance with sensible defaults */
const api = axios.create({
   baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
   withCredentials: true, // include cookies in cross-origin requests
   headers: {
      "Content-Type": "application/json",
   },
});

// --------------------------------------------------
// Request interceptor
// Attach the JWT Bearer token from cookies to every
// outgoing request so the backend can authenticate it.
// --------------------------------------------------
api.interceptors.request.use(
   async (config: InternalAxiosRequestConfig) => {
      const accessToken = getTokenCookie();

      if (accessToken && config.headers) {
         try {
            // Verify and decode the token — throws if expired or invalid
            const { token } = await verifyToken(accessToken);
            config.headers.Authorization = `Bearer ${token}`;
         } catch {
            // Token invalid or expired — skip the header; response interceptor handles 401
         }
      }

      return config;
   },
   (error: AxiosError) => {
      return Promise.reject(error);
   }
);

// --------------------------------------------------
// Response interceptor
// On 401 (Unauthorized), clear local auth state and
// redirect to the login page so the user can re-authenticate.
// --------------------------------------------------
api.interceptors.response.use(
   (response) => response,
   (error: AxiosError<any>) => {
      const status = error.response?.status;
      const url = error.config?.url ?? "";

      // Only redirect on 401 for non-auth endpoints.
      // Auth endpoints (login/signup) return 401 for wrong credentials — those
      // should surface as mutation errors in the UI, not trigger a redirect.
      const isAuthEndpoint = url.includes("/auth");

      if (status === 401 && !isAuthEndpoint && typeof window !== "undefined") {
         useAuthStore.getState().logout();
         removeTokenCookie();
         window.location.href = "/login";
      }

      // Lift the backend's human-readable message onto the Error object so that
      // React Query's onError / error.message gives the real reason, not the
      // generic axios "Request failed with status code 4xx" string.
      if (error.response?.data) {
         return Promise.reject(error.response.data);
      }

      return Promise.reject(error);
   }
);

export default api;
