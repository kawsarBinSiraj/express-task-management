import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Users, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/services/user-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ROUTES } from "@/utils/constants";
import { toast } from "sonner";
import type { UserItem, UpdateUserInput } from "@/types";

const LIMIT = 10;

const ROLE_COLORS: Record<string, string> = {
   ADMIN: "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300",
   USER:  "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export function UsersPage() {
   const [page, setPage] = useState(1);
   const [editUser, setEditUser] = useState<UserItem | null>(null);
   const [deleteUser, setDeleteUser] = useState<UserItem | null>(null);
   const queryClient = useQueryClient();

   const { data, isLoading, isError } = useQuery({
      queryKey: ["users", page, LIMIT],
      queryFn: () => userService.getUsers(page, LIMIT),
   });

   const totalPages = data?.meta.totalPages ?? 1;

   const { mutate: updateUser, isPending: isUpdating } = useMutation({
      mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
         userService.updateUser(id, input),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["users"] });
         toast.success("User updated successfully.");
         setEditUser(null);
      },
      onError: (err: any) => {
         toast.error(err?.response?.data?.message || err?.message || "Failed to update user.");
      },
   });

   const { mutate: confirmDelete, isPending: isDeleting } = useMutation({
      mutationFn: (id: string) => userService.deleteUser(id),
      onSuccess: () => {
         queryClient.invalidateQueries({ queryKey: ["users"] });
         toast.success("User deleted successfully.");
         setDeleteUser(null);
      },
      onError: (err: any) => {
         toast.error(err?.response?.data?.message || err?.message || "Failed to delete user.");
      },
   });

   return (
      <div className="flex flex-col gap-6">
         {/* Page header */}
         <div className="flex items-center justify-between">
            <div>
               <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Users</h1>
               <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">Manage all registered users</p>
            </div>
            <Button asChild>
               <Link to={ROUTES.CREATE_USER}>
                  <Plus className="size-4" />
                  Create User
               </Link>
            </Button>
         </div>

         {/* Table card */}
         <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white dark:border-slate-800/70 dark:bg-slate-900">
            {isLoading ? (
               <div className="flex items-center justify-center py-20 text-sm text-slate-400">Loading…</div>
            ) : isError ? (
               <div className="flex items-center justify-center py-20 text-sm text-destructive">Failed to load users.</div>
            ) : !data?.users.length ? (
               <EmptyState />
            ) : (
               <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                     <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-left dark:border-slate-800 dark:bg-slate-800/60">
                           <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Name</th>
                           <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300">Email</th>
                           <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Role</th>
                           <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Tasks</th>
                           <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Joined</th>
                           <th className="px-4 py-3 font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {data.users.map((user: UserItem) => (
                           <tr key={user.id} className="transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                              <td className="px-4 py-3">
                                 <div className="flex items-center gap-2.5">
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold uppercase dark:bg-slate-700">
                                       {user.name[0]}
                                    </div>
                                    <span className="font-medium text-slate-900 dark:text-slate-100">{user.name}</span>
                                 </div>
                              </td>
                              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{user.email}</td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                 <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                                    {user.role}
                                 </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                 <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                    {user.noOfTask}
                                 </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-slate-400">
                                 {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                 <div className="flex items-center gap-1">
                                    <button
                                       onClick={() => setEditUser(user)}
                                       className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                                       title="Edit user"
                                    >
                                       <Pencil className="size-4" />
                                    </button>
                                    <button
                                       onClick={() => setDeleteUser(user)}
                                       className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400"
                                       title="Delete user"
                                    >
                                       <Trash2 className="size-4" />
                                    </button>
                                 </div>
                              </td>
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
                     <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                        <ChevronLeft className="size-4" />
                        Prev
                     </Button>
                     <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                        Next
                        <ChevronRight className="size-4" />
                     </Button>
                  </div>
               </div>
            )}
         </div>

         {/* Edit Dialog */}
         {editUser && (
            <EditUserDialog
               user={editUser}
               isPending={isUpdating}
               onClose={() => setEditUser(null)}
               onSave={(input) => updateUser({ id: editUser.id, input })}
            />
         )}

         {/* Delete Confirmation Dialog */}
         {deleteUser && (
            <Dialog open onOpenChange={() => setDeleteUser(null)}>
               <DialogContent>
                  <DialogHeader>
                     <DialogTitle>Delete User</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                     Are you sure you want to delete{" "}
                     <span className="font-semibold text-slate-900 dark:text-slate-100">{deleteUser.name}</span>?
                     This action cannot be undone.
                  </p>
                  <DialogFooter className="mt-2">
                     <Button variant="outline" onClick={() => setDeleteUser(null)} disabled={isDeleting}>
                        Cancel
                     </Button>
                     <Button variant="destructive" onClick={() => confirmDelete(deleteUser.id)} disabled={isDeleting}>
                        {isDeleting ? "Deleting…" : "Delete"}
                     </Button>
                  </DialogFooter>
               </DialogContent>
            </Dialog>
         )}
      </div>
   );
}

// ── Edit Dialog ──────────────────────────────────────────────────────────────

interface EditUserDialogProps {
   user: UserItem;
   isPending: boolean;
   onClose: () => void;
   onSave: (input: UpdateUserInput) => void;
}

function EditUserDialog({ user, isPending, onClose, onSave }: EditUserDialogProps) {
   const [name, setName] = useState(user.name);
   const [email, setEmail] = useState(user.email);
   const [role, setRole] = useState<"ADMIN" | "USER">(user.role);

   function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      onSave({ name: name.trim(), email: email.trim(), role });
   }

   return (
      <Dialog open onOpenChange={onClose}>
         <DialogContent>
            <DialogHeader>
               <DialogTitle>Edit User</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
               <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-name">Name</Label>
                  <Input
                     id="edit-name"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     required
                     minLength={2}
                     maxLength={100}
                  />
               </div>
               <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                     id="edit-email"
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                  />
               </div>
               <div className="flex flex-col gap-1.5">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as "ADMIN" | "USER")}>
                     <SelectTrigger id="edit-role">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="USER">USER</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                     </SelectContent>
                  </Select>
               </div>
               <DialogFooter className="mt-2">
                  <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
                     Cancel
                  </Button>
                  <Button type="submit" disabled={isPending}>
                     {isPending ? "Saving…" : "Save Changes"}
                  </Button>
               </DialogFooter>
            </form>
         </DialogContent>
      </Dialog>
   );
}

// ── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
   return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
         <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-amber-50 dark:bg-amber-500/10">
            <Users className="size-7 text-amber-500" />
         </div>
         <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">No users yet</h2>
         <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create the first user to get started.</p>
         <Button asChild className="mt-4">
            <Link to={ROUTES.CREATE_USER}>
               <Plus className="size-4" />
               Create User
            </Link>
         </Button>
      </div>
   );
}
