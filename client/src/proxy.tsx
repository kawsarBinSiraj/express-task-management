/**
 * React route-guard middleware — replaces the Next.js proxy.ts.
 *
 * Two guard components:
 *  - ProtectedRoute : requires a valid JWT cookie. Unauthenticated users
 *                     are redirected to /login with a callbackUrl param.
 *  - GuestRoute     : auth-only pages (login, signup, …). Authenticated
 *                     users are redirected straight to /dashboard.
 *
 * Both components render an <Outlet /> for nested routes when the guard
 * passes, and a <Navigate /> when it does not.
 */

import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getTokenCookie, removeTokenCookie } from "@/lib/cookies";
import { verifyToken } from "@/lib/jwt";
import { ROUTES } from "@/utils/constants";

type AuthStatus = "pending" | "authorized" | "unauthorized";

// ── ProtectedRoute ─────────────────────────────────────────────────────────

/**
 * Wrap any routes that require a valid JWT access-token cookie.
 *
 * Guard logic:
 *  - No token            → redirect to /login?callbackUrl=<pathname>
 *  - Valid token         → render the nested route via <Outlet />
 *  - Invalid/expired     → clear cookie, redirect to /login
 */
export function ProtectedRoute() {
    const [status, setStatus] = useState<AuthStatus>("pending");
    const location = useLocation();
    const token = getTokenCookie();

    useEffect(() => {
        if (!token) {
            setStatus("unauthorized");
            return;
        }

        verifyToken(token)
            .then(() => setStatus("authorized"))
            .catch(() => {
                removeTokenCookie();
                setStatus("unauthorized");
            });
    }, [token]);

    if (status === "pending") return null;

    if (status === "unauthorized") {
        const loginUrl = `${ROUTES.LOGIN}?callbackUrl=${encodeURIComponent(location.pathname)}`;
        return <Navigate to={loginUrl} replace />;
    }

    return <Outlet />;
}

// ── GuestRoute ─────────────────────────────────────────────────────────────

/**
 * Wrap auth-only routes (login, signup, forgot, reset, verify).
 *
 * Guard logic:
 *  - Valid token present → redirect to /dashboard (already logged in)
 *  - No / invalid token  → render the nested route via <Outlet />
 */
export function GuestRoute() {
    const [status, setStatus] = useState<AuthStatus>("pending");
    const token = getTokenCookie();

    useEffect(() => {
        if (!token) {
            setStatus("unauthorized");
            return;
        }

        verifyToken(token)
            .then(() => setStatus("authorized"))
            .catch(() => setStatus("unauthorized"));
    }, [token]);

    if (status === "pending") return null;

    if (status === "authorized") {
        return <Navigate to={ROUTES.DASHBOARD} replace />;
    }

    return <Outlet />;
}
