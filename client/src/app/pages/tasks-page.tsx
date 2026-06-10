import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, ClipboardList, ChevronLeft, ChevronRight, Trash2, Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/services/task-service";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ROUTES } from "@/utils/constants";
import { toast } from "sonner";
import type { Task, TaskStatus, TaskPriority } from "@/types";

const STATUS_LABELS: Record<TaskStatus, string> = {
   TODO: "To Do",
   IN_PROGRESS: "In Progress",
   DONE: "Done",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
   TODO: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
   IN_PROGRESS: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
   DONE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300",
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
   LOW: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
   MEDIUM: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
   HIGH: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
};

const LIMIT = 10;

export function TasksPage() {
   const [page, setPage] = useState(1);
   const [confirmId, setConfirmId] = useState<string | null>(null);
   const { data, isLoading, isError } = useQuery({
      queryKey: ["tasks", page, LIMIT],
      queryFn: () => taskService.getTasks(page, LIMIT),
   });
   
   const user = useAuthStore((s) => s.user);
   const isAdmin = user?.role === "ADMIN" || user?.role === 'SUPER_ADMIN';
   const queryClient = useQueryClient();

   const { mutate: deleteTask, isPending: isDeleting } = useMutation({
      mutationFn: (id: string) => taskService.deleteTask(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["tasks"] });
         toast.success("Task deleted.");
         setConfirmId(null);
      },
      onError: () => toast.error("Failed to delete task."),
   });

   const totalPages = data?.meta.totalPages ?? 1;


   return (
      <div className="flex flex-col gap-6">
         {/* Page header */}
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Tasks</h1>
               <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                  {isAdmin ? "Manage all tasks" : "Your assigned tasks"}
               </p>
            </div>
            {isAdmin && (
               <Button asChild>
                  <Link to={ROUTES.CREATE_TASK}>
                     <Plus className="size-4" />
                     Create Task
                  </Link>
               </Button>
            )}
         </div>

         {/* Table card */}
         <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white dark:border-slate-800/70 dark:bg-slate-900">
            {isLoading ? (
               <div className="flex items-center justify-center py-20 text-sm text-slate-400">Loading…</div>
            ) : isError ? (
               <div className="flex items-center justify-center py-20 text-sm text-destructive">Failed to load tasks.</div>
            ) : !data?.tasks.length ? (
               <EmptyState isAdmin={isAdmin} />
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                     <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-800 dark:bg-slate-800/60">
                           <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Title</th>
                           <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Status</th>
                           <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Priority</th>
                           <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Assigned To</th>
                           <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Due Date</th>
                           {isAdmin && <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Actions</th>}
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.tasks.map((task: Task) => (
                           <tr key={task.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="px-4 py-3 max-w-[300px]">
                                 <p className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{task.title}</p>
                                 {task.description && (
                                    <p className="mt-0.5 text-xs text-slate-400 line-clamp-1">{task.description}</p>
                                 )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                 <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLORS[task.status]}`}>
                                    {STATUS_LABELS[task.status]}
                                 </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                 <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}>
                                    {task.priority}
                                 </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                 <div className="flex items-center gap-2">
                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold uppercase dark:bg-slate-700">
                                       {task.assignee.name[0]}
                                    </div>
                                    <span className="text-slate-700 dark:text-slate-300">{task.assignee.name}</span>
                                 </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                                 {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}
                              </td>
                              {isAdmin && (
                                 <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center gap-1">
                                       <Link
                                          to={`/tasks/${task.id}/edit`}
                                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-700/50 transition-colors"
                                       >
                                          <Pencil className="size-3.5" />
                                          Edit
                                       </Link>
                                       <button
                                          onClick={() => setConfirmId(task.id)}
                                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10 transition-colors"
                                       >
                                          <Trash2 className="size-3.5" />
                                          Delete
                                       </button>
                                    </div>
                                 </td>
                              )}
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            )}

            {/* Pagination */}
            {data && data.meta.totalPages > 1 && (
               <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                     Page {page} of {totalPages} &mdash; {data.meta.total} total
                  </p>
                  <div className="flex items-center gap-2">
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                     >
                        <ChevronLeft className="size-4" />
                        Prev
                     </Button>
                     <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                     >
                        Next
                        <ChevronRight className="size-4" />
                     </Button>
                  </div>
               </div>
            )}
         </div>

         {/* Delete confirm dialog */}
         <Dialog open={!!confirmId} onOpenChange={(open) => !open && setConfirmId(null)}>
            <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
               <DialogHeader>
                  <DialogTitle>Delete task?</DialogTitle>
                  <DialogDescription>
                     This action cannot be undone. The task will be permanently removed.
                  </DialogDescription>
               </DialogHeader>
               <DialogFooter>
                  <Button variant="outline" onClick={() => setConfirmId(null)} disabled={isDeleting}>
                     Cancel
                  </Button>
                  <Button
                     variant="destructive"
                     disabled={isDeleting}
                     onClick={() => confirmId && deleteTask(confirmId)}
                  >
                     {isDeleting ? "Deleting…" : "Delete"}
                  </Button>
               </DialogFooter>
            </DialogContent>
         </Dialog>
      </div>
   );
}

function EmptyState({ isAdmin }: { isAdmin: boolean }) {
   return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
         <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10">
            <ClipboardList className="size-7 text-amber-500" />
         </div>
         <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">No tasks yet</h2>
         <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {isAdmin ? "Create the first task to get started." : "You have no assigned tasks."}
         </p>
         {isAdmin && (
            <Button asChild className="mt-4">
               <Link to={ROUTES.CREATE_TASK}>
                  <Plus className="size-4" />
                  Create Task
               </Link>
            </Button>
         )}
      </div>
   );
}
