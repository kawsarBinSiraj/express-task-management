/**
 * File: src/services/auth.service.ts
 * Purpose: Auth business logic for signup and signin, separated from HTTP handlers.
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from '../config/prisma';
import config from '../config';
import { signToken } from '../utils/jwt';
import { sendPasswordResetEmail } from '../utils/mailer';
import { AppError } from '../middlewares/error.middleware';
import {
  ISignupInput,
  ISigninInput,
  IAuthResponse,
  IUserPayload,
} from '../interfaces/auth.interface';

/* Signup service: create user, hash password, sign JWT, and return payload. */
export const signup = async (data: ISignupInput): Promise<IAuthResponse> => {
  const { name, email, password } = data;

  /* Fail fast if the email already exists before hashing password. */
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError('An account with this email already exists.', 409);
  }

  /* Hash the password using bcrypt with configured salt rounds. */
  const hashedPassword = await bcrypt.hash(password, config.bcrypt.saltRounds);

  /* Create the user and select only safe return fields. */
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  /* Build the sanitized user payload for the response. */
  const userPayload: IUserPayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  /* Sign a JWT for the new user. */
  const token = signToken({ id: user.id, email: user.email, role: user.role });

  return { user: userPayload, token };
};

/* forgotPassword service: generate a reset token, persist it, and send the email. */
export const forgotPassword = async (email: string): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { email } });
  /* Always resolve successfully to prevent email enumeration. */
  if (!user) return;

  /* Invalidate any existing unused tokens for this user. */
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  /* Generate a secure random token and store its SHA-256 hash. */
  const rawToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + config.email.resetTokenTtlMs);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token: hashedToken, expiresAt },
  });

  const resetUrl = `${config.client.url}/reset?token=${rawToken}`;
  await sendPasswordResetEmail(user.email, resetUrl);
};

/* resetPassword service: validate the token and set the new password. */
export const resetPassword = async (rawToken: string, newPassword: string): Promise<void> => {
  const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

  const record = await prisma.passwordResetToken.findUnique({ where: { token: hashedToken } });

  if (!record || record.used || record.expiresAt < new Date()) {
    throw new AppError('Reset link is invalid or has expired.', 400);
  }

  const hashed = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { password: hashed } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
  ]);
};

/* updateProfile service: update the authenticated user's name and/or email. */
export const updateProfile = async (
  userId: string,
  data: { name?: string; email?: string },
): Promise<IUserPayload> => {
  if (data.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing && existing.id !== userId) {
      throw new AppError('An account with this email already exists.', 409);
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.name ? { name: data.name } : {}),
      ...(data.email ? { email: data.email.toLowerCase() } : {}),
    },
    select: { id: true, name: true, email: true, role: true },
  });

  return user as IUserPayload;
};

/* changePassword service: verify current password then set a new one. */
export const changePassword = async (
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new AppError('User not found.', 404);

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) throw new AppError('Current password is incorrect.', 400);

  const hashed = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
  await prisma.user.update({ where: { id: userId }, data: { password: hashed } });
};

/* Signin service: verify credentials and return user payload plus JWT. */
export const signin = async (data: ISigninInput): Promise<IAuthResponse> => {
  const { email, password } = data;

  /* Retrieve the user by email, including hash for password check. */
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    /* Generic 401 for missing user to prevent enumeration. */
    throw new AppError('Invalid email or password.', 401);
  }

  /* Compare the submitted password with the stored bcrypt hash. */
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password.', 401);
  }

  /* Prepare the safe response payload without password data. */
  const userPayload: IUserPayload = { ...user };

  const token = signToken(userPayload);

  return { user: userPayload, token };
};
