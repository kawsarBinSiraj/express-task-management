"use strict";
/**
 * File: src/validations/auth.validation.ts
 * Purpose: Zod schemas for auth request validation and sanitization.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.changePasswordSchema = exports.updateProfileSchema = exports.signinSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
/* Signup schema for POST /api/v1/auth/signup with normalized name/email and strong password rules. */
exports.signupSchema = zod_1.z.object({
    name: zod_1.z
        .string()
        .trim()
        .nonempty('Name is required.')
        .min(2, 'Name must be at least 2 characters long.')
        .max(100, 'Name must not exceed 100 characters.'),
    email: zod_1.z
        .string()
        .trim()
        .nonempty('Email is required.')
        .transform((value) => value.toLowerCase())
        .pipe(zod_1.z.email({ error: 'Please provide a valid email address.' })),
    password: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters long.')
        .max(72, 'Password must not exceed 72 characters.')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit.',
    })
        .nonempty('Password is required.'),
});
/* Signin schema for POST /api/v1/auth/signin. Validates email and password only. */
exports.signinSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .trim()
        .nonempty('Email is required.')
        .transform((value) => value.toLowerCase())
        .pipe(zod_1.z.email({ error: 'Please provide a valid email address.' })),
    password: zod_1.z.string().nonempty('Password is required.'),
});
/* updateProfile schema for PATCH /api/v1/auth/me */
exports.updateProfileSchema = zod_1.z
    .object({
    name: zod_1.z.string().trim().min(2, 'Name must be at least 2 characters.').max(100).optional(),
    email: zod_1.z
        .string()
        .trim()
        .transform((v) => v.toLowerCase())
        .pipe(zod_1.z.email({ error: 'Please provide a valid email address.' }))
        .optional(),
})
    .refine((d) => d.name !== undefined || d.email !== undefined, {
    message: 'At least one field (name or email) is required.',
});
/* changePassword schema for PATCH /api/v1/auth/me/password */
exports.changePasswordSchema = zod_1.z.object({
    currentPassword: zod_1.z.string().nonempty('Current password is required.'),
    newPassword: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters.')
        .max(72, 'Password must not exceed 72 characters.')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit.',
    }),
});
/* forgotPassword schema for POST /api/v1/auth/forgot-password */
exports.forgotPasswordSchema = zod_1.z.object({
    email: zod_1.z
        .string()
        .trim()
        .nonempty('Email is required.')
        .transform((v) => v.toLowerCase())
        .pipe(zod_1.z.email({ error: 'Please provide a valid email address.' })),
});
/* resetPassword schema for POST /api/v1/auth/reset-password */
exports.resetPasswordSchema = zod_1.z.object({
    token: zod_1.z.string().nonempty('Reset token is required.'),
    newPassword: zod_1.z
        .string()
        .min(8, 'Password must be at least 8 characters.')
        .max(72, 'Password must not exceed 72 characters.')
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit.',
    }),
});
//# sourceMappingURL=auth.validation.js.map