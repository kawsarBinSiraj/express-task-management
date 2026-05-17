/**
 * File: src/config/index.ts
 * Purpose: Load and validate environment configuration into a typed object.
 */

import 'dotenv/config';

/* Application config object with env, database, jwt, and bcrypt settings. */
const config = {
    /*
     * NODE_ENV controls logging verbosity, error detail, Prisma query logging,
     * and other env-specific behavior across the codebase.
     * Defaults to 'development' so local runs "just work" without a .env file.
     */
    env: process.env.NODE_ENV ?? 'development',

    /*
     * The TCP port the HTTP server binds to.
     * parseInt with radix 10 is used explicitly to avoid octal parsing edge cases.
     */
    port: parseInt(process.env.PORT ?? '5000', 10),

    database: {
        /*
         * Full PostgreSQL connection string including credentials, host, and options.
         * For local Postgres, include the database name and schema.
         * Example: postgresql://postgres:password@localhost:5432/app_db?schema=public
         */
        url: process.env.DATABASE_URL ?? '',
    },

    jwt: {
        /*
         * The HMAC secret used to sign and verify JWTs.
         * In production this should be a long random string (≥ 32 characters).
         * Rotate this key to immediately invalidate all existing sessions.
         */
        secret: process.env.JWT_SECRET ?? 'secret',

        /*
         * How long a newly issued JWT remains valid.
         * Accepts any value understood by the `ms` library (e.g. '7d', '2h', '30m').
         * Shorter expiry = better security; longer = better UX.
         */
        expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    },

    bcrypt: {
        /*
         * Number of bcrypt hashing rounds (work factor).
         * NIST recommends a minimum of 10. Each additional round doubles hashing time.
         * Default of 12 is a reasonable balance between security and performance.
         */
        saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS ?? '12', 10),
    },

    client: {
        /*
         * Origin of the Vite dev server — used for CSP and CORS in development.
         * Should match the VITE_PORT / host used by vite.config.ts.
         */
        devOrigin: process.env.CLIENT_VITE_DEV_SERVER_URL ?? `http://localhost:${process.env.VITE_PORT ?? '5173'}`,

        /*
         * Comma-separated list of allowed CORS origins in production.
         * If unset, all origins are allowed (suitable for open APIs).
         */
        allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') ?? null,

        /*
         * Public base URL of the client app (used in password-reset email links).
         * Must NOT end with a trailing slash.
         */
        url: process.env.CLIENT_URL ?? `http://localhost:${process.env.VITE_PORT ?? '5173'}`,
    },

    email: {
        host: process.env.EMAIL_HOST ?? 'sandbox.smtp.mailtrap.io',
        port: parseInt(process.env.EMAIL_PORT ?? '587', 10),
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER ?? 'fef3353ce6a6e7',
        pass: process.env.EMAIL_PASS ?? '4331cdc51fc8dd',
        from: process.env.EMAIL_FROM ?? 'noreply@taskmanager.local',

        /* How long (ms) a password-reset token stays valid. Default: 1 hour. */
        resetTokenTtlMs: parseInt(process.env.RESET_TOKEN_TTL_MS ?? String(60 * 60 * 1000), 10),

    },
} as const;

export default config;
