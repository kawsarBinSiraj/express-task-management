/**
 * hooks/use-login.ts
 *
 * React Query mutation hook — signs the user in.
 *
 * On success:
 *  1. Writes the user to the Zustand auth store.
 *  2. Navigates to /dashboard.
 *     If a `callbackUrl` query param exists the user is sent there instead.
 */

"use client";

import { useMutation } from "@tanstack/react-query";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";
import { setTokenCookie } from "@/lib/cookies";
import { signToken } from "@/lib/jwt";
import type { LoginCredentials } from "@/types";
import { ROUTES } from "@/utils/constants";
import { toast } from "sonner";

export function useLogin() {
   const navigate = useNavigate();
   const [searchParams] = useSearchParams();
   const setUser = useAuthStore((state) => state.setUser);

   return useMutation<any, Error, LoginCredentials>({
      /** Validate credentials, sign JWT, set cookie */
      mutationFn: async (credentials:any) => {
         const res = await authService.login(credentials);
         const data = res?.data || {}
         setUser(data.user);
         const token = await signToken({ ...data });
         setTokenCookie(token);
         await new Promise((resolve) => setTimeout(resolve, 1000));
         return data;
      },

      /** Persist user in Zustand and navigate to the intended destination */
      onSuccess: (data:any) => {
         toast.success(`Welcome back, ${data?.user.name}!`);

         // Honour the callbackUrl from the proxy redirect if present
         const callbackUrl = searchParams.get("callbackUrl");
         navigate(callbackUrl ?? ROUTES.DASHBOARD);
      },
   });
}
