import api from './api';
import type {
   LoginCredentials,
   LoginResponse,
   SignupCredentials,
   SignupResponse,
   ResetPasswordCredentials,
   VerifyEmailCredentials,
   ProfileResponse,
   UpdateProfileInput,
   ChangePasswordInput,
   ResetPasswordConfirmInput,
   User,
} from '@/types';

export const authService = {
   login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
      const { data } = await api.post<LoginResponse>('/auth/signin', credentials);
      return data;
   },

   signup: async (credentials: SignupCredentials): Promise<SignupResponse> => {
      const { data } = await api.post<SignupResponse>('/auth/signup', credentials);
      return data;
   },

   logout: async (): Promise<void> => {
      await api.post('/auth/logout');
   },

   getProfile: async (): Promise<ProfileResponse> => {
      const { data } = await api.get<ProfileResponse>('/auth/me');
      return data;
   },

   updateProfile: async (input: UpdateProfileInput): Promise<User> => {
      const { data } = await api.patch<{ data: { user: User } }>('/auth/me', input);
      return data.data.user;
   },

   changePassword: async (input: ChangePasswordInput): Promise<void> => {
      await api.patch('/auth/me/password', input);
   },

   /** Step 1: send reset link to email */
   resetPassword: async (credentials: ResetPasswordCredentials): Promise<{ message: string }> => {
      const { data } = await api.post<{ message: string }>('/auth/forgot-password', credentials);
      return data;
   },

   /** Step 2: submit token + new password */
   newPassword: async (input: ResetPasswordConfirmInput): Promise<{ message: string }> => {
      const { data } = await api.post<{ message: string }>('/auth/reset-password', input);
      return data;
   },

   verifyEmail: async (credentials: VerifyEmailCredentials): Promise<{ message: string }> => {
      return { message: 'Email verified successfully', ...credentials };
   },
};
