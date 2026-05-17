/**
 * File: src/interfaces/auth.interface.ts
 * Purpose: Shared auth-related type definitions.
 * Note: Keep this file as pure interface declarations only.
 */

import { Role } from '../generated/prisma/client.js';

/* Signup input shape for POST /api/v1/auth/signup. Password is plain text until hashing. */
export interface ISignupInput {
  name: string;
  email: string;
  password: string;
}

/* Signin input shape for POST /api/v1/auth/signin. Only email and password. */
export interface ISigninInput {
  email: string;
  password: string;
}

/* Public-safe user payload returned by auth endpoints. No password included. */
export interface IUserPayload {
  id: string;
  name: string;
  email: string;
  role: Role;
}

/* Response shape for auth operations: sanitized user and JWT. */
export interface IAuthResponse {
  user: IUserPayload;
  token: string;
}

/* JWT payload shape stored in tokens. Contains only id, email, role, and optional iat/exp. */
export interface IJwtPayload {
  id: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
}
