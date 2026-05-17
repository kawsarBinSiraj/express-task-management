/**
 * File: src/utils/jwt.ts
 * Purpose: Sign and verify JWTs with centralized config and typed payloads.
 */

import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { IJwtPayload } from '../interfaces/auth.interface';

/* Sign a JWT for the given payload using config-defined secret and expiry. */
export const signToken = (
  payload: Omit<IJwtPayload, 'iat' | 'exp'>,
): string => {
  const options: SignOptions = {
    /*
     * Token expiry e.g. '7d', '2h', '30m'.
     * Read from the JWT_EXPIRES_IN environment variable.
     * Short-lived tokens (≤ 1h) combined with refresh tokens
     * are recommended for high-security applications.
     */
    expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
  };

  return jwt.sign(payload, config.jwt.secret, options);
};

/* Verify a JWT and return the decoded IJwtPayload, throwing on invalid or expired tokens. */
export const verifyToken = (token: string): IJwtPayload => {
  /*
   * `jwt.verify` returns `string | JwtPayload`.
   * We intersect with IJwtPayload to narrow the type since we know our
   * tokens always contain id, email, and role in the payload.
   */
  const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload &
    IJwtPayload;

  return decoded;
};
