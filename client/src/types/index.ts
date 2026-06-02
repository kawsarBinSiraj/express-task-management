// ===========================
// User & Auth Types
// ===========================

/** Represents an authenticated user in the system */
export interface User {
   id: string;
   email: string;
   name: string;
   role?: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
}

/** Credentials submitted from the login form */
export interface LoginCredentials {
   email: string;
   password: string;
}

/** Fields submitted from the signup form */
export interface SignupCredentials {
   name: string;
   email: string;
   password: string;
}

/** Fields submitted from the reset-password form (step 1 — request email) */
export interface ResetPasswordCredentials {
   email: string;
}

/** Fields submitted from the set-new-password form (step 2 — after clicking email link) */
export interface NewPasswordCredentials {
   token: string; // reset token from the URL query param
   newPassword: string;
}

/** Fields submitted from the verify-email form */
export interface VerifyEmailCredentials {
   code: string;
}

/** Fields submitted from the update-profile form */
export interface UpdateProfileInput {
   name?: string;
   email?: string;
}

/** Fields submitted from the change-password form */
export interface ChangePasswordInput {
   currentPassword: string;
   newPassword: string;
}

/** Fields submitted from the reset-password confirm form (step 2 — token + new password) */
export interface ResetPasswordConfirmInput {
   token: string;
   newPassword: string;
}

/** Response shape returned after a successful login */
export interface LoginResponse {
   data: {
      user: User;
      token: string; // JWT stored client-side via js-cookie
      message: string;
   };
}

/** Response shape returned after a successful signup */
export interface SignupResponse {
   user: User;
   token: string;
   message: string;
}

/** Response shape returned when fetching the user profile */
export interface ProfileResponse {
   data: any;
}

// ===========================
// JWT Types
// ===========================

/** Custom JWT payload embedded inside every signed token */
export interface JWTPayload {
   sub?: string; // User ID
   token?: string; // Original token
   email: string;
   name: string;
   iat?: number; // Issued-at timestamp
   exp?: number; // Expiration timestamp
   [key: string]: any; // Allow extra fields if needed
}

// ===========================
// API Types
// ===========================

/** Standard error returned by service calls */
export interface ApiError {
   message: string;
   status: number;
}

/** Generic wrapper for successful responses */
export interface ApiResponse<T> {
   data: T;
   message?: string;
}

// ===========================
// Task Types
// ===========================

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface TaskMember {
   id: string;
   name: string;
   email: string;
}

export interface Task {
   id: string;
   title: string;
   description: string | null;
   status: TaskStatus;
   priority: TaskPriority;
   dueDate: string | null;
   assignedTo: string;
   createdBy: string;
   assignee: TaskMember;
   creator: TaskMember;
   createdAt: string;
   updatedAt: string;
}

export interface PaginationMeta {
   total: number;
   page: number;
   limit: number;
   totalPages: number;
   hasNextPage: boolean;
   hasPrevPage: boolean;
}

export interface TaskListResponse {
   tasks: Task[];
   meta: PaginationMeta;
}

export interface CreateTaskInput {
   title: string;
   description?: string;
   assignedTo: string;
   status?: TaskStatus;
   priority?: TaskPriority;
   dueDate?: string;
}

// ===========================
// User Management Types
// ===========================

export interface UserItem {
   id: string;
   name: string;
   email: string;
   role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
   noOfTask: number;
   createdAt: string;
}

export interface UserListResponse {
   users: UserItem[];
   meta: PaginationMeta;
}

export interface UpdateUserInput {
   name?: string;
   email?: string;
   role?: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
}

export interface DashboardStats {
   totalUsers: number;
   totalAdmins: number;
   totalMembers: number;
   totalTasks: number;
}
