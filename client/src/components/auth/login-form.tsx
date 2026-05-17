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
import { ArrowLeft, Check, Copy, Eye, EyeOff, KeyRound, Sparkles } from "lucide-react";
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
   const [copied, setCopied] = React.useState<"email" | "password" | null>(null);
   const hideCredentialsTimeout = React.useRef<ReturnType<typeof setTimeout> | null>(null);

   function handleCredentialsEnter() {
      if (hideCredentialsTimeout.current) clearTimeout(hideCredentialsTimeout.current);
      setShowCredentials(true);
   }

   function handleCredentialsLeave() {
      hideCredentialsTimeout.current = setTimeout(() => setShowCredentials(false), 300);
   }

   function copyToClipboard(text: string, field: "email" | "password") {
      navigator.clipboard.writeText(text);
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
   }

   const {
      register,
      handleSubmit,
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
               <div className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
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
                     <div className="absolute right-0 top-9 z-20 w-60 rounded-2xl border border-amber-200/70 bg-white p-3 shadow-lg shadow-amber-900/10 dark:border-amber-500/20 dark:bg-slate-900">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">Demo credentials</p>
                        {([
                           { label: "Email", value: "admin@example.com", field: "email" as const },
                           { label: "Password", value: "Admin@123", field: "password" as const },
                        ]).map(({ label, value, field }) => (
                           <div key={field} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-amber-50/80 dark:hover:bg-amber-500/10">
                              <div className="min-w-0">
                                 <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{label}</p>
                                 <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">{value}</p>
                              </div>
                              <button
                                 type="button"
                                 onClick={() => copyToClipboard(value, field)}
                                 className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:text-amber-600 dark:hover:text-amber-400"
                                 aria-label={`Copy ${label}`}
                              >
                                 {copied === field ? <Check className="size-3.5 text-green-500" /> : <Copy className="size-3.5" />}
                              </button>
                           </div>
                        ))}
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
               <Button type="submit" className="h-11 w-full rounded-xl text-sm font-semibold" disabled={isPending}>
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
