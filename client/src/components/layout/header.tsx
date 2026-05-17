import { useLocation } from "react-router-dom"
import { Menu, Sun, Moon, Monitor, LogOut, UserRound, Settings, ChevronDown } from "lucide-react"
import { useTheme } from "@/lib/theme-provider"
import { useAuthStore } from "@/store/auth-store"
import { useUIStore } from "@/store/ui-store"
import { useLogout } from "@/hooks/auth/use-logout"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { ROUTES } from "@/routes/config"
import { cn } from "@/lib/utils"
import { useNavigate } from "react-router-dom"
import { useState } from "react"

const PAGE_TITLES: Record<string, string> = {
  [ROUTES.DASHBOARD]: "Dashboard",
  [ROUTES.USERS]: "Users",
  [ROUTES.SETTINGS]: "Settings",
  [ROUTES.PROFILE]: "Profile",
}

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const

export function Header() {
  const { theme, setTheme } = useTheme()
  const user = useAuthStore((s) => s.user)
  const { toggleSidebar } = useUIStore()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()
  const location = useLocation()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const pageTitle = PAGE_TITLES[location.pathname] ?? "Dashboard"

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "U"

  const ThemeIcon = THEME_OPTIONS.find((o) => o.value === theme)?.icon ?? Monitor

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md transition-all dark:border-slate-800 dark:bg-slate-950/70",
      )}
    >
      {/* Hamburger — mobile only */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <Menu className="size-5" />
      </Button>

      {/* Page title */}
      <div className="flex flex-1 items-center gap-2">
        <h1 className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {pageTitle}
        </h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1">

        {/* ── Theme switcher ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              aria-label="Switch theme"
              className="text-slate-500 size-9 p-0 rounded-full hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
            >
              <ThemeIcon className="size-4.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuLabel>Appearance</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup
              value={theme}
              onValueChange={(v) => setTheme(v as "light" | "dark" | "system")}
            >
              {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
                <DropdownMenuRadioItem key={value} value={value} className="gap-2 cursor-pointer">
                  <Icon className="size-3.5" />
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* ── User menu ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex h-10 items-center gap-2 rounded-lg px-2 py-1 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800/60"
            >
              <Avatar className="size-8">
                <AvatarFallback className="bg-gray-200 border border-slate-300 text-black text-[12px]">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden max-w-30 truncate text-sm font-medium sm:inline">
                {user?.name ?? "User"}
              </span>
              <ChevronDown className="size-3.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel className="font-normal">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => navigate(ROUTES.PROFILE)}
            >
              <UserRound className="size-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer gap-2"
              onClick={() => navigate(ROUTES.SETTINGS)}
            >
              <Settings className="size-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-destructive focus:text-destructive"
              onClick={() => setShowLogoutConfirm(true)}
            >
              <LogOut className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Logout confirm dialog */}
      <Dialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              You will be signed out of your account and redirected to the login page.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogoutConfirm(false)} disabled={isLoggingOut}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isLoggingOut}
              onClick={() => logout()}
            >
              {isLoggingOut ? "Signing out…" : "Sign out"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
