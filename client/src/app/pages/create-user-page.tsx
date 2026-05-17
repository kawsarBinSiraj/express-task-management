import { useForm, type Resolver, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROUTES } from "@/utils/constants";
import { toast } from "sonner";
import type { SignupCredentials } from "@/types";

// ── Validation schema (mirrors backend signupSchema) ────────────────────────

const schema = yup.object({
   name: yup
      .string()
      .trim()
      .required("Name is required.")
      .min(2, "Name must be at least 2 characters.")
      .max(100, "Name must not exceed 100 characters."),
   email: yup
      .string()
      .trim()
      .required("Email is required.")
      .email("Please provide a valid email address."),
   password: yup
      .string()
      .required("Password is required.")
      .min(8, "Password must be at least 8 characters.")
      .max(72, "Password must not exceed 72 characters.")
      .matches(
         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
         "Must contain at least one uppercase letter, one lowercase letter, and one digit.",
      ),
   role: yup.string().oneOf(["USER", "ADMIN"]).required(),
});

type CreateUserFields = yup.InferType<typeof schema>;

// ── Component ────────────────────────────────────────────────────────────────

export function CreateUserPage() {
   const navigate = useNavigate();
   const queryClient = useQueryClient();
   const [showPassword, setShowPassword] = React.useState(false);

   const { mutate: createUser, isPending, error } = useMutation({
      mutationFn: (input: SignupCredentials) => authService.signup(input),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["users"] });
         queryClient.invalidateQueries({ queryKey: ["members"] });
         toast.success("User created successfully.");
         navigate(ROUTES.USERS);
      },
   });

   const {
      register,
      handleSubmit,
      control,
      formState: { errors },
   } = useForm<CreateUserFields>({
      resolver: yupResolver(schema) as Resolver<CreateUserFields>,
      defaultValues: { role: "USER" },
   });

   function onSubmit(data: CreateUserFields) {
      createUser({ name: data.name, email: data.email, password: data.password });
   }

   return (
      <div>
         {/* Back link */}
         <Link
            to={ROUTES.USERS}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
         >
            <ArrowLeft className="size-4" />
            Back to Users
         </Link>

         <div className="max-w-4xl rounded-2xl border border-slate-200/70 bg-white p-6 dark:border-slate-800/70 dark:bg-slate-900">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Create User</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Fill in the details to create a new user account.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-5">
               {/* Server error */}
               {error && (
                  <div role="alert" className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                     {error.message}
                  </div>
               )}

               {/* Name */}
               <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                     Full Name <span className="text-destructive">*</span>
                  </Label>
                  <Input id="name" placeholder="John Doe" className="h-11 rounded-xl" {...register("name")} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
               </div>

               {/* Email */}
               <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                     Email <span className="text-destructive">*</span>
                  </Label>
                  <Input id="email" type="email" placeholder="you@example.com" className="h-11 rounded-xl" {...register("email")} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
               </div>

               {/* Password */}
               <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                     Password <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                     <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="········"
                        className="h-11 rounded-xl pr-10"
                        {...register("password")}
                     />
                     <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                     >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                     </button>
                  </div>
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
               </div>

               {/* Role */}
               <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                     Role
                  </Label>
                  <Controller
                     name="role"
                     control={control}
                     render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                           <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                           </SelectTrigger>
                           <SelectContent>
                              <SelectItem value="USER">User (Member)</SelectItem>
                              <SelectItem value="ADMIN">Admin</SelectItem>
                           </SelectContent>
                        </Select>
                     )}
                  />
               </div>

               {/* Actions */}
               <div className="flex items-center justify-end gap-3 pt-2">
                  <Button variant="outline" type="button" asChild>
                     <Link to={ROUTES.USERS}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isPending}>
                     {isPending ? "Creating…" : "Create User"}
                  </Button>
               </div>
            </form>
         </div>
      </div>
   );
}
