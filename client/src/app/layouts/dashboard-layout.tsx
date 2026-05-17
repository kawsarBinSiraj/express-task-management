import { Outlet } from "react-router-dom"
import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { useUIStore } from "@/store/ui-store"
import { cn } from "@/lib/utils"

export default function DashboardLayout() {
  const isSidebarCollapsed = useUIStore((s) => s.isSidebarCollapsed)

  return (
    <div className="relative flex min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Decorative ambient blobs */}
      <div className="pointer-events-none fixed -left-32 top-0 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl dark:bg-amber-500/10" />
      <div className="pointer-events-none fixed -right-24 bottom-0 h-96 w-96 rounded-full bg-sky-300/20 blur-3xl dark:bg-sky-500/10" />

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main content ── */}
      <div
        className={cn(
          "relative flex min-h-screen flex-1 flex-col transition-all duration-300 ease-in-out",
          // Offset for desktop sidebar width
          isSidebarCollapsed ? "md:ml-16" : "md:ml-60",
        )}
      >
        <Header />

        <main className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
