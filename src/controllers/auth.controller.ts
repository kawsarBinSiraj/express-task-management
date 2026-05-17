import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import catchAsync from '../utils/catchAsync';
import { ISignupInput, ISigninInput } from '../interfaces/auth.interface';

/* Signup handler: create a new account and return token data. */
export const signup = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    /* req.body is validated upstream, so this assertion is safe. */
    const input: ISignupInput = req.body;

    const result = await authService.signup(input);

    sendSuccess(res, 201, 'Account created successfully.', result);
  },
);

/* Signin handler: authenticate user and return token data. */
export const signin = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const input: ISigninInput = req.body;

    const result = await authService.signin(input);

    sendSuccess(res, 200, 'Signed in successfully.', result);
  },
);

/* Logout handler: stateless logout — client must discard the JWT. */
export const logout = catchAsync(
  async (_req: Request, res: Response): Promise<void> => {
    sendSuccess(res, 200, 'Signed out successfully.', null);
  },
);

/* getMe handler: return the authenticated user's decoded token payload. */
export const getMe = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    /* req.user is set by authenticate middleware before this handler. */
    sendSuccess(res, 200, 'User profile retrieved successfully.', {
      user: req.user,
    });
  },
);

/* updateProfile handler: update the authenticated user's name and/or email. */
export const updateProfile = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const user = await authService.updateProfile(req.user!.id, req.body);
    sendSuccess(res, 200, 'Profile updated successfully.', { user });
  },
);

/* changePassword handler: verify current password then set a new one. */
export const changePassword = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { currentPassword, newPassword } = req.body;
    await authService.changePassword(req.user!.id, currentPassword, newPassword);
    sendSuccess(res, 200, 'Password changed successfully.', null);
  },
);

/* forgotPassword handler: send a reset email (always 200 to prevent enumeration). */
export const forgotPassword = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    await authService.forgotPassword(req.body.email);
    sendSuccess(res, 200, 'If that email exists, a reset link has been sent.', null);
  },
);

/* resetPassword handler: validate token and set new password. */
export const resetPassword = catchAsync(
  async (req: Request, res: Response): Promise<void> => {
    const { token, newPassword } = req.body;
    await authService.resetPassword(token, newPassword);
    sendSuccess(res, 200, 'Password reset successfully.', null);
  },
);
