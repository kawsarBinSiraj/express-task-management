import { useForm, type Resolver, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ROUTES } from '@/utils/constants';
import { toast } from 'sonner';
import type { CreateTaskInput } from '@/types';

// ── Validation schema ───────────────────────────────────────────────────────

const schema = yup.object({
   title: yup.string().trim().required('Title is required.').max(200, 'Max 200 characters.'),
   description: yup.string().trim().max(2000).optional(),
   assignedTo: yup.string().required('Please select a member.'),
   status: yup.string().oneOf(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
   priority: yup.string().oneOf(['LOW', 'MEDIUM', 'HIGH']).optional(),
   dueDate: yup.string().optional(),
});

type CreateTaskFields = yup.InferType<typeof schema>;

// ── Component ───────────────────────────────────────────────────────────────

export function CreateTaskPage() {
   const navigate = useNavigate();
   const queryClient = useQueryClient();

   const {
      mutate: createTask,
      isPending,
      error,
   } = useMutation({
      mutationFn: (input: CreateTaskInput) => taskService.createTask(input),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ['tasks'] });
         toast.success('Task created successfully.');
         navigate(ROUTES.TASKS);
      },
      onError: (err: any) => {
         toast.error(err?.message || 'Failed to create task.');
      },
   });

   const { data: members = [], isLoading: membersLoading } = useQuery({
      queryKey: ['members'],
      queryFn: () => taskService.getMembers(),
      staleTime: 5 * 60 * 1000,
   });

   const {
      register,
      handleSubmit,
      control,
      formState: { errors },
   } = useForm<CreateTaskFields>({
      resolver: yupResolver(schema) as Resolver<CreateTaskFields>,
      defaultValues: { status: 'TODO', priority: 'MEDIUM' },
   });

   function onSubmit(data: CreateTaskFields) {
      // Convert the plain date string ("YYYY-MM-DD") the date input returns into
      // a full UTC ISO-8601 datetime string that the backend's Zod schema expects.
      // Date-only strings are parsed as UTC midnight per the ECMAScript spec, so
      // toISOString() gives "YYYY-MM-DDT00:00:00.000Z" — stored as UTC in Postgres
      // and printed in the user's local timezone on the tasks list.
      const dueDate = data.dueDate ? new Date(data.dueDate).toISOString() : undefined;

      createTask({
         title: data.title,
         description: data.description || undefined,
         assignedTo: data.assignedTo,
         status: data.status as any,
         priority: data.priority as any,
         dueDate,
      });
   }

   return (
      <div>
         {/* Back link */}
         <Link
            to={ROUTES.TASKS}
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
         >
            <ArrowLeft className="size-4" />
            Back to Tasks
         </Link>

         <div className="max-w-4xl rounded-2xl border border-slate-200/70 bg-white p-6 dark:border-slate-800/70 dark:bg-slate-900">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Create Task</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
               Fill in the details and assign the task to a member.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-5">
               {/* Server error */}
               {error && (
                  <div
                     role="alert"
                     className="rounded-xl border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
                  >
                     {error.message}
                  </div>
               )}

               {/* Title */}
               <div className="flex flex-col gap-1.5">
                  <Label
                     htmlFor="title"
                     className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >
                     Title <span className="text-destructive">*</span>
                  </Label>
                  <Input id="title" placeholder="Task title" className="h-11 rounded-xl" {...register('title')} />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
               </div>

               {/* Description */}
               <div className="flex flex-col gap-1.5">
                  <Label
                     htmlFor="description"
                     className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >
                     Description
                  </Label>
                  <textarea
                     id="description"
                     rows={3}
                     placeholder="Optional description…"
                     className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-slate-900/80 resize-none"
                     {...register('description')}
                  />
                  {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
               </div>

               {/* Assign To */}
               <div className="flex flex-col gap-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                     Assign To <span className="text-destructive">*</span>
                  </Label>
                  <Controller
                     name="assignedTo"
                     control={control}
                     render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange} disabled={membersLoading}>
                           <SelectTrigger>
                              <SelectValue placeholder={membersLoading ? 'Loading members…' : 'Select a member'} />
                           </SelectTrigger>
                           <SelectContent>
                              {members.map((m) => (
                                 <SelectItem key={m.id} value={m.id}>
                                    {m.name} ({m.email})
                                 </SelectItem>
                              ))}
                           </SelectContent>
                        </Select>
                     )}
                  />
                  {errors.assignedTo && <p className="text-xs text-destructive">{errors.assignedTo.message}</p>}
               </div>

               {/* Status + Priority row */}
               <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                     <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Status
                     </Label>
                     <Controller
                        name="status"
                        control={control}
                        render={({ field }) => (
                           <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                 <SelectValue placeholder="Status" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="TODO">To Do</SelectItem>
                                 <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                 <SelectItem value="DONE">Done</SelectItem>
                              </SelectContent>
                           </Select>
                        )}
                     />
                  </div>

                  <div className="flex flex-col gap-1.5">
                     <Label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        Priority
                     </Label>
                     <Controller
                        name="priority"
                        control={control}
                        render={({ field }) => (
                           <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                 <SelectValue placeholder="Priority" />
                              </SelectTrigger>
                              <SelectContent>
                                 <SelectItem value="LOW">Low</SelectItem>
                                 <SelectItem value="MEDIUM">Medium</SelectItem>
                                 <SelectItem value="HIGH">High</SelectItem>
                              </SelectContent>
                           </Select>
                        )}
                     />
                  </div>
               </div>

               {/* Due Date */}
               <div className="flex flex-col gap-1.5">
                  <Label
                     htmlFor="dueDate"
                     className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >
                     Due Date
                  </Label>
                  <Input
                     id="dueDate"
                     type="date"
                     min={new Date().toISOString().split('T')[0]}
                     className="h-11 rounded-xl"
                     {...register('dueDate')}
                  />
               </div>

               {/* Submit */}
               <div className="flex items-center justify-end gap-3 pt-2">
                  <Button variant="outline" type="button" asChild>
                     <Link to={ROUTES.TASKS}>Cancel</Link>
                  </Button>
                  <Button type="submit" disabled={isPending}>
                     {isPending ? 'Creating…' : 'Create Task'}
                  </Button>
               </div>
            </form>
         </div>
      </div>
   );
}
