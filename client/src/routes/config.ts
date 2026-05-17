/**
 * routes/config.ts
 *
 * Centralised route path constants — single source of truth for all
 * client-side routes. Import from here instead of hard-coding strings.
 *
 * Note: mirrors utils/constants.ts ROUTES/PROTECTED_ROUTES/AUTH_ROUTES
 * and is re-exported here so the routes folder is self-contained.
 */

export {
    ROUTES,
    PROTECTED_ROUTES,
    AUTH_ROUTES,
} from "@/utils/constants";
