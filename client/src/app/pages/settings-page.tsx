import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth-service";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
import type { UpdateProfileInput, ChangePasswordInput } from "@/types";

const profileSchema = yup.object({
   name: yup.string().trim().min(2, 'Name must be at least 2 characters.').max(100).optional(),
   email: yup.string().trim().email('Please provide a valid email address.').optional(),
});

const passwordSchema = yup.object({
   currentPassword: yup.string().required('Current password is required.'),
   newPassword: yup
      .string()
      .required('New password is required.')
      .min(8, 'Password must be at least 8 characters.')
      .max(72, 'Password must not exceed 72 characters.')
      .matches(
         /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/,
         'Must contain at least one uppercase letter, one lowercase letter, and one digit.',
      ),
   confirmPassword: yup
      .string()
      .required('Please confirm your new password.')
      .oneOf([yup.ref('newPassword')], 'Passwords do not match.'),
});

type ProfileFields = yup.InferType<typeof profileSchema>;
type PasswordFields = yup.InferType<typeof passwordSchema>;

export function SettingsPage() {
   return (
      <div className="max-w-2xl flex flex-col gap-6">
         <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Settings</h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Manage your account details</p>
         </div>
         <ProfileSection />
         <PasswordSection />
      </div>
   );
}

function ProfileSection() {
   const user = useAuthStore((s) => s.user);
   const setUser = useAuthStore((s) => s.setUser);

   const { register, handleSubmit, formState: { errors } } = useForm<ProfileFields>({
      resolver: yupResolver(profileSchema) as Resolver<ProfileFields>,
      defaultValues: { name: user?.name ?? '', email: user?.email ?? '' },
   });

   const { mutate, isPending } = useMutation({
      mutationFn: (input: UpdateProfileInput) => authService.updateProfile(input),
      onSuccess: (updated) => {
         setUser({ ...user, ...updated } as any);
         toast.success('Profile updated successfully.');
      },
      onError: (err: any) => {
         toast.error(err?.response?.data?.message || err?.message || 'Failed to update profile.');
      },
   });

   function onSubmit(data: ProfileFields) {
      const payload: UpdateProfileInput = {};
      if (data.name?.trim()) payload.name = data.name.trim();
      if (data.email?.trim()) payload.email = data.email.trim();
      if (Object.keys(payload).length === 0) return;
      mutate(payload);
   }

   return (
      <section className="rounded-2xl border border-slate-200/70 bg-white p-6 dark:border-slate-800/70 dark:bg-slate-900">
         <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Profile information</h2>
         <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Update your name and email address.</p>

         <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
               <Label htmlFor="profile-name">Name</Label>
               <Input id="profile-name" {...register('name')} placeholder="Your name" />
               {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
               <Label htmlFor="profile-email">Email</Label>
               <Input id="profile-email" type="email" {...register('email')} placeholder="you@example.com" />
               {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="flex justify-end">
               <Button type="submit" disabled={isPending}>
                  {isPending ? 'Saving…' : 'Save changes'}
               </Button>
            </div>
         </form>
      </section>
   );
}

function PasswordSection() {
   const [show, setShow] = useState<Record<string, boolean>>({});
   const toggle = (field: string) => setShow((s) => ({ ...s, [field]: !s[field] }));

   const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordFields>({
      resolver: yupResolver(passwordSchema) as Resolver<PasswordFields>,
   });

   const { mutate, isPending } = useMutation({
      mutationFn: (input: ChangePasswordInput) => authService.changePassword(input),
      onSuccess: () => {
         toast.success('Password changed successfully.');
         reset();
      },
      onError: (err: any) => {
         toast.error(err?.response?.data?.message || err?.message || 'Failed to change password.');
      },
   });

   function onSubmit(data: PasswordFields) {
      mutate({ currentPassword: data.currentPassword, newPassword: data.newPassword });
   }

   return (
      <section className="rounded-2xl border border-slate-200/70 bg-white p-6 dark:border-slate-800/70 dark:bg-slate-900">
         <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Change password</h2>
         <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Make sure to use a strong password.</p>

         <form onSubmit={handleSubmit(onSubmit)} className="mt-5 flex flex-col gap-4">
            <PasswordField
               id="current-password"
               label="Current password"
               registration={register('currentPassword')}
               error={errors.currentPassword?.message}
               show={show.current ?? false}
               onToggle={() => toggle('current')}
            />
            <PasswordField
               id="new-password"
               label="New password"
               registration={register('newPassword')}
               error={errors.newPassword?.message}
               show={show.new ?? false}
               onToggle={() => toggle('new')}
            />
            <PasswordField
               id="confirm-password"
               label="Confirm new password"
               registration={register('confirmPassword')}
               error={errors.confirmPassword?.message}
               show={show.confirm ?? false}
               onToggle={() => toggle('confirm')}
            />
            <div className="flex justify-end">
               <Button type="submit" disabled={isPending}>
                  {isPending ? 'Updating…' : 'Update password'}
               </Button>
            </div>
         </form>
      </section>
   );
}

interface PasswordFieldProps {
   id: string;
   label: string;
   registration: object;
   error?: string;
   show: boolean;
   onToggle: () => void;
}

function PasswordField({ id, label, registration, error, show, onToggle }: PasswordFieldProps) {
   return (
      <div className="flex flex-col gap-1.5">
         <Label htmlFor={id}>{label}</Label>
         <div className="relative">
            <Input
               id={id}
               type={show ? 'text' : 'password'}
               className="pr-10"
               {...(registration as any)}
            />
            <button
               type="button"
               onClick={onToggle}
               className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
               tabIndex={-1}
            >
               {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
         </div>
         {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
   );
}