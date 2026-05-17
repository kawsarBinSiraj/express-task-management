/**
 * utils/constants.ts
 *
 * Centralised route constants.
 *
 * Import from here instead of hard-coding strings so a route rename
 * only requires a single change in this file.
 */

/** Client-side page routes */
export const ROUTES = {
    HOME:        "/",
    LOGIN:       "/login",
    SIGNUP:      "/signup",
    FORGOT:      "/forgot",
    RESET:       "/reset",
    VERIFY:      "/verify",
    DASHBOARD:   "/dashboard",
    USERS:       "/users",
    CREATE_USER: "/users/create",
    TASKS:       "/tasks",
    CREATE_TASK: "/tasks/create",
    EDIT_TASK:   "/tasks/:id/edit",
    SETTINGS:    "/settings",
    PROFILE:     "/profile",
} as const;

/**
 * Routes that require a valid JWT cookie to access.
 * Referenced by proxy.ts to decide whether to run the auth guard.
 */
export const PROTECTED_ROUTES = ["/dashboard", "/users", "/users/create", "/tasks", "/tasks/create", "/settings", "/profile"] as const;
// Note: /tasks/:id/edit is also protected but uses dynamic segment, handled by ProtectedRoute wrapper

/**
 * Auth-only routes — authenticated users are redirected away from these.
 * Referenced by proxy.ts.
 */
export const AUTH_ROUTES = [
    "/login",
    "/signup",
    "/forgot",
    "/reset",
    "/verify",
] as const;
