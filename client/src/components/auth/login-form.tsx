/**
 * components/auth/login-form.tsx
 *
 * Client component — sign-in form.
 *
 * Uses react-hook-form + yup for validation and the useLogin()
 * mutation hook for submitting credentials.
 */

import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, KeyRound, Sparkles } from "lucide-react";
import { useLogin } from "@/hooks/auth/use-login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import GoogleLogin from "./google-login";
import type { GoogleLoginSuccessPayload } from "./google-login";

// ---- Yup schema ------------------------------------------------------

const loginSchema = yup.object({
   email: yup.string().email("Invalid email address").required("Email is required"),
   password: yup.string().min(1, "Password is required").required("Password is required"),
});

type LoginFields = yup.InferType<typeof loginSchema>;

// ---- Component --------------------------------------------------------

export function LoginForm() {
   const { mutate: login, isPending, error } = useLogin();
   const [showPassword, setShowPassword] = React.useState(false);
   const [showCredentials, setShowCredentials] = React.useState(false);
   const hideCredentialsTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

   function handleCredentialsEnter() {
      if (hideCredentialsTimeout.current) clearTimeout(hideCredentialsTimeout.current);
      setShowCredentials(true);
   }

   function handleCredentialsLeave() {
      hideCredentialsTimeout.current = setTimeout(() => setShowCredentials(false), 300);
   }

   const {
      register,
      handleSubmit,
      setValue,
      formState: { errors },
   } = useForm<LoginFields>({
      resolver: yupResolver(loginSchema),
      defaultValues: { email: "", password: "" },
   });

   function onSubmit(data: LoginFields) {
      login({ email: data.email, password: data.password });
   }

   function handleGoogleSuccess({ tokenResponse, tokenInfo, isLoading }: GoogleLoginSuccessPayload) {
      console.log("[Google OAuth] isLoading", isLoading);
      console.log("[Google OAuth] tokenResponse", tokenResponse);
      console.log("[Google OAuth] tokenInfo", tokenInfo);
   }


   return (
      <Card className="mx-auto w-full max-w-md rounded-3xl border-white/50 bg-white/85 shadow-2xl shadow-amber-950/10 backdrop-blur-md dark:border-white/10 dark:bg-slate-950/65 dark:shadow-black/40">
         {/* Header */}
         <CardHeader className="space-y-3 pb-3">
            <div className="flex items-center gap-2">
               <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200/80 bg-gradient-to-b from-amber-50 to-amber-100/80 px-3 py-1 text-xs font-medium text-amber-800 dark:border-amber-500/25 dark:from-amber-500/15 dark:to-amber-500/10 dark:text-amber-300">
                  <Sparkles className="size-3.5" />
                  Welcome back
               </div>

               {/* Demo credentials hint */}
               <div
                  className="relative ml-auto"
                  onMouseEnter={handleCredentialsEnter}
                  onMouseLeave={handleCredentialsLeave}
               >
                  <button
                     type="button"
                     className="flex size-7 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-600 transition-colors hover:bg-amber-100 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20"
                     aria-label="Show demo credentials"
                  >
                     <KeyRound className="size-3.5" />
                  </button>

                  {showCredentials && (
                     <div className="absolute right-0 top-9 z-20 w-56 rounded-2xl border border-amber-200/70 bg-white p-3 shadow-lg shadow-amber-900/10 dark:border-amber-500/20 dark:bg-slate-900">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Demo credentials</p>
                        <div className="rounded-lg bg-amber-50/60 px-2.5 py-2 dark:bg-amber-500/10">
                           <div className="mb-1">
                              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Email</p>
                              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">admin@example.com</p>
                           </div>
                           <div>
                              <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">Password</p>
                              <p className="text-xs font-medium text-slate-700 dark:text-slate-200">Admin@123</p>
                           </div>
                        </div>
                        <button
                           type="button"
                           onClick={() => {
                              setValue("email", "admin@example.com", { shouldValidate: true });
                              setValue("password", "Admin@123", { shouldValidate: true });
                           }}
                           className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-gradient-to-b from-amber-50 to-amber-100/80 py-2 text-[10px] font-semibold uppercase tracking-wider text-amber-700 transition-all hover:from-amber-100 hover:to-amber-200/80 active:scale-[0.98] dark:border-amber-500/25 dark:from-amber-500/15 dark:to-amber-500/10 dark:text-amber-400 dark:hover:from-amber-500/25 dark:hover:to-amber-500/15"
                        >
                           <KeyRound className="size-3" />
                           Fill all fields
                        </button>
                     </div>
                  )}
               </div>
            </div>
            <CardTitle className="text-3xl tracking-tight">Sign in</CardTitle>
            <CardDescription className="text-sm text-slate-600 dark:text-slate-300">
               Enter your credentials to access your account
            </CardDescription>
         </CardHeader>

         <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="flex flex-col gap-5">
               {/* Server error banner */}
               {error && (
                  <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                     {error.message}
                  </div>
               )}

               {/* Email */}
               <div className="flex flex-col gap-2">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                     Email
                  </Label>
                  <Input
                     id="email"
                     type="email"
                     placeholder="you@example.com"
                     autoComplete="email"
                     className="h-11 rounded-xl bg-white/90 dark:bg-slate-900/80"
                     {...register("email")}
                  />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
               </div>

               {/* Password */}
               <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                     <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
                        Password
                     </Label>
                     <Link to="/forgot" className="text-xs font-medium text-slate-500 underline-offset-4 hover:text-slate-800 hover:underline dark:text-slate-300 dark:hover:text-slate-100">
                        Forgot password?
                     </Link>
                  </div>
                  <div className="relative">
                     <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="········"
                        autoComplete="current-password"
                        className="h-11 rounded-xl bg-white/90 pr-10 dark:bg-slate-900/80"
                        {...register("password")}
                     />
                     <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                     >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                     </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
               </div>

            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-2">
               <Button type="submit" className="h-11 w-full cursor-pointer rounded-xl bg-amber-500 text-sm font-semibold text-white hover:bg-amber-500/80 active:scale-[0.99] dark:bg-amber-500 dark:hover:bg-amber-500/80" disabled={isPending}>
                  {isPending ? "Signing in…" : "Sign in"}
               </Button>

               <div className="relative w-full py-1">
                  <div className="absolute inset-0 flex items-center">
                     <span className="w-full border-t border-slate-200/80 dark:border-slate-700/70" />
                  </div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-[0.18em]">
                     <span className="bg-white px-2 text-slate-500 dark:bg-slate-950 dark:text-slate-400">or continue with</span>
                  </div>
               </div>

               <GoogleLogin onSuccess={handleGoogleSuccess} />

               <p className="text-center text-sm text-slate-600 dark:text-slate-300">
                  Don&apos;t have an account?{" "}
                  <Link to="/signup" className="font-semibold text-slate-900 underline-offset-4 hover:underline dark:text-slate-100">
                     Sign up
                  </Link>
               </p>
            </CardFooter>
         </form>
      </Card>
   );
}
