/**
 * File: src/validations/auth.validation.ts
 * Purpose: Zod schemas for auth request validation and sanitization.
 */

import { z } from 'zod';
import { ISignupInput, ISigninInput } from '../interfaces/auth.interface';

/* Signup schema for POST /api/v1/auth/signup with normalized name/email and strong password rules. */
export const signupSchema: z.ZodType<ISignupInput> = z.object({
  name: z
    .string()
    .trim()
    .nonempty('Name is required.')
    .min(2, 'Name must be at least 2 characters long.')
    .max(100, 'Name must not exceed 100 characters.'),

  email: z
    .string()
    .trim()
    .nonempty('Email is required.')
    .transform((value) => value.toLowerCase())
    .pipe(z.email({ error: 'Please provide a valid email address.' })),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .max(72, 'Password must not exceed 72 characters.')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, and one digit.',
    })
    .nonempty('Password is required.'),
});

/* Signin schema for POST /api/v1/auth/signin. Validates email and password only. */
export const signinSchema: z.ZodType<ISigninInput> = z.object({
  email: z
    .string()
    .trim()
    .nonempty('Email is required.')
    .transform((value) => value.toLowerCase())
    .pipe(z.email({ error: 'Please provide a valid email address.' })),

  password: z.string().nonempty('Password is required.'),
});

/* updateProfile schema for PATCH /api/v1/auth/me */
export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100).optional(),
    email: z
      .string()
      .trim()
      .transform((v) => v.toLowerCase())
      .pipe(z.email({ error: 'Please provide a valid email address.' }))
      .optional(),
  })
  .refine((d) => d.name !== undefined || d.email !== undefined, {
    message: 'At least one field (name or email) is required.',
  });

/* changePassword schema for PATCH /api/v1/auth/me/password */
export const changePasswordSchema = z.object({
  currentPassword: z.string().nonempty('Current password is required.'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(72, 'Password must not exceed 72 characters.')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit.',
    }),
});

/* forgotPassword schema for POST /api/v1/auth/forgot-password */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .nonempty('Email is required.')
    .transform((v) => v.toLowerCase())
    .pipe(z.email({ error: 'Please provide a valid email address.' })),
});

/* resetPassword schema for POST /api/v1/auth/reset-password */
export const resetPasswordSchema = z.object({
  token: z.string().nonempty('Reset token is required.'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(72, 'Password must not exceed 72 characters.')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one digit.',
    }),
});
