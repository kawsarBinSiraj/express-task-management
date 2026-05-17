import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate } from '../middlewares/auth.middleware';
import {
  signupSchema,
  signinSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validations/auth.validation';

const router = Router();

/* Signup route: validate signup schema then create the user and return a JWT. */
router.post('/signup', validateRequest(signupSchema), authController.signup);

/* Signin route: validate signin data then authenticate and return JWT. */
router.post('/signin', validateRequest(signinSchema), authController.signin);

/* Logout route: requires a valid JWT; client is responsible for discarding it. */
router.post('/logout', authenticate, authController.logout);

/* Protected /me route: authenticate JWT and return current user payload. */
router.get('/me', authenticate, authController.getMe);

/* Update profile: update name and/or email of the authenticated user. */
router.patch('/me', authenticate, validateRequest(updateProfileSchema), authController.updateProfile);

/* Change password: verify current password then set a new one. */
router.patch('/me/password', authenticate, validateRequest(changePasswordSchema), authController.changePassword);

/* Forgot password: send a reset link to the provided email. */
router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);

/* Reset password: validate token and set new password. */
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);

export default router;
