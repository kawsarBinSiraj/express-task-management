"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
import type { ResetPasswordConfirmInput } from "@/types";

export function useNewPassword() {
    return useMutation<{ message: string }, Error, ResetPasswordConfirmInput>({
        mutationFn: (credentials) => authService.newPassword(credentials),
    });
}
