import { NavLink, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { LayoutDashboard, Users, Settings, Kanban  , UserRound, ShieldCheck, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROUTES } from '@/routes/config';
import { useUIStore } from '@/store/ui-store';
import { useAuthStore } from '@/store/auth-store';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface NavItem {
   title: string;
   href: string;
   icon: React.ElementType;
   adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
   { title: 'Dashboard', href: ROUTES.DASHBOARD, icon: LayoutDashboard },
   { title: 'Tasks', href: ROUTES.TASKS, icon: Kanban  },
   { title: 'Users', href: ROUTES.USERS, icon: Users, adminOnly: true },
   { title: 'Settings', href: ROUTES.SETTINGS, icon: Settings },
   { title: 'Profile', href: ROUTES.PROFILE, icon: UserRound },
];

export function Sidebar() {
   const { isSidebarOpen, isSidebarCollapsed, setSidebarOpen, toggleSidebarCollapsed } = useUIStore();
   const user = useAuthStore((s) => s.user);
   const location = useLocation();

   // Close mobile sidebar on route change
   useEffect(() => {
      setSidebarOpen(false);
   }, [location.pathname, setSidebarOpen]);

   const isAdmin = user?.role === 'ADMIN';
   const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

   return (
      <TooltipProvider delayDuration={300}>
         {/* Mobile overlay backdrop */}
         {isSidebarOpen && (
            <div
               className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
               onClick={() => setSidebarOpen(false)}
            />
         )}

         {/* Sidebar panel */}
         <aside
            className={cn(
               'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-slate-200 bg-white/90 backdrop-blur-xl transition-all duration-300 ease-in-out dark:border-slate-800 dark:bg-slate-950/80',
               // Mobile: slide in/out
               'md:translate-x-0',
               isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
               // Desktop: collapsed = icon-only width
               isSidebarCollapsed ? 'md:w-16' : 'md:w-60',
               // Always full width on mobile when open
               'w-60',
            )}
         >
            {/* ── Brand ── */}
            <div
               className={cn(
                  'flex h-16 shrink-0 items-center border-b border-slate-200 px-4 dark:border-slate-800 gap-2',
               )}
            >
               <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-400 to-orange-500 shadow-sm">
                  <ShieldCheck className="size-5 text-white" />
               </div>

               <span
                  className={cn(
                     'font-semibold tracking-tight text-slate-900 dark:text-slate-100 transition-all duration-600',
                     isSidebarCollapsed ? 'md:overflow-hidden md:opacity-0' : '',
                  )}
               >
                  AdminKit
               </span>

               {/* Mobile close button */}
               <Button
                  variant="ghost"
                  size="icon-sm"
                  className="ml-auto md:hidden"
                  onClick={() => setSidebarOpen(false)}
               >
                  <X className="size-4" />
               </Button>
            </div>

            {/* ── Nav items ── */}
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
               <p className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                  Menu
               </p>

               {visibleItems.map((item) => (
                  <Tooltip key={item.href}>
                     <TooltipTrigger asChild>
                        <NavLink
                           to={item.href}
                           className={({ isActive }) =>
                              cn(
                                 'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all',
                                 isActive
                                    ? 'bg-amber-50 text-amber-900 dark:bg-amber-500/15 dark:text-amber-300'
                                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100',
                                 isSidebarCollapsed && 'md:justify-center md:px-0',
                              )
                           }
                        >
                           {({ isActive }) => (
                              <>
                                 <item.icon
                                    className={cn(
                                       'shrink-0 transition-colors',
                                       'size-4.25',
                                       isActive
                                          ? 'text-amber-600 dark:text-amber-400'
                                          : 'text-slate-500 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:text-slate-300',
                                    )}
                                 />

                                 <span
                                    className={cn(
                                       'truncate transition-all duration-600',
                                       isSidebarCollapsed ? 'md:overflow-hidden md:opacity-0' : '',
                                    )}
                                 >
                                    {item.title}
                                 </span>

                                 {!isSidebarCollapsed && item.adminOnly && (
                                    <span className="ml-auto rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                                       Admin
                                    </span>
                                 )}
                              </>
                           )}
                        </NavLink>
                     </TooltipTrigger>
                     {isSidebarCollapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
                  </Tooltip>
               ))}
            </nav>

            {/* ── Collapse toggle (desktop only) ── */}
            <div className="hidden shrink-0 border-t border-slate-200 p-2 pl-3 md:flex dark:border-slate-800">
               <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                     'inline-flex cursor-pointer gap-1  text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100',
                     isSidebarCollapsed && 'justify-center px-0',
                  )}
                  onClick={toggleSidebarCollapsed}
               >
                  {isSidebarCollapsed ? (
                     <ChevronRight className="size-4" />
                  ) : (
                     <>
                        <ChevronLeft className="size-4" />
                        <span className="text-xs">Collapse</span>
                     </>
                  )}
               </Button>
            </div>
         </aside>
      </TooltipProvider>
   );
}
