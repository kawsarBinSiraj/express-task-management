/**
 * routes/AppRouter.tsx
 *
 * Root router — maps URL paths to page components using React Router v6.
 *
 *   GuestRoute  (redirects logged-in users → /dashboard)
 *   └── AuthLayout  (shared auth page wrapper)
 *
 *   ProtectedRoute  (redirects unauthenticated users → /login)
 *   └── DashboardLayout  (sidebar + header wrapper)
 *       ├── /dashboard  → DashboardPage
 *       ├── /users      → UsersPage  (admin only in sidebar, route-level accessible)
 *       ├── /settings   → SettingsPage
 *       └── /profile    → ProfilePage
 *
 *   /*  → redirect to /login
 */

import { Navigate, Route, Routes } from 'react-router-dom';
import { GuestRoute, ProtectedRoute } from '@/proxy';
import AuthLayout from '@/app/layouts/auth-layout';
import DashboardLayout from '@/app/layouts/dashboard-layout';
import { LoginPage } from '@/app/pages/login-page';
import { SignupPage } from '@/app/pages/signup-page';
import { ForgotPage } from '@/app/pages/forgot-page';
import { ResetPage } from '@/app/pages/reset-page';
import { VerifyPage } from '@/app/pages/verify-page';
import { DashboardPage } from '@/app/pages/dashboard-page';
import { UsersPage } from '@/app/pages/users-page';
import { CreateUserPage } from '@/app/pages/create-user-page';
import { TasksPage } from '@/app/pages/tasks-page';
import { CreateTaskPage } from '@/app/pages/create-task-page';
import { EditTaskPage } from '@/app/pages/edit-task-page';
import { SettingsPage } from '@/app/pages/settings-page';
import { ProfilePage } from '@/app/pages/profile-page';
import { ROUTES } from './config';

export function AppRouter() {
   return (
      <Routes>
         {/* ── Auth routes — redirect to dashboard if already logged in ── */}
         <Route element={<GuestRoute />}>
            <Route element={<AuthLayout />}>
               <Route path={ROUTES.LOGIN} element={<LoginPage />} />
               <Route path={ROUTES.SIGNUP} element={<SignupPage />} />
               <Route path={ROUTES.FORGOT} element={<ForgotPage />} />
               <Route path={ROUTES.RESET} element={<ResetPage />} />
               <Route path={ROUTES.VERIFY} element={<VerifyPage />} />
            </Route>
         </Route>

         {/* ── Protected routes — redirect to login if not authenticated ── */}
         <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
               <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
               <Route path={ROUTES.USERS} element={<UsersPage />} />
               <Route path={ROUTES.CREATE_USER} element={<CreateUserPage />} />
               <Route path={ROUTES.TASKS} element={<TasksPage />} />
               <Route path={ROUTES.CREATE_TASK} element={<CreateTaskPage />} />
               <Route path={ROUTES.EDIT_TASK} element={<EditTaskPage />} />
               <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
               <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
            </Route>
         </Route>

         {/* ── Catch-all fallback ── */}
         <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
      </Routes>
   );
}
