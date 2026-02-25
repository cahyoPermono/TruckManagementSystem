import type { FC, ReactNode } from "react"
import { LayoutDashboard, Truck, Settings, Menu, Bell, CircleUser, MapPin, LogOut, Shield } from "lucide-react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { useAuthStore } from '../store'

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Vehicles", href: "/vehicles", icon: Truck },
  { name: "Trail Setups", href: "/trails", icon: MapPin },
  { name: "Tires Master", href: "/tires", icon: Settings },
  { name: "IAM & Roles", href: "/iam/roles", icon: Shield },
  { name: "Users", href: "/iam/users", icon: CircleUser },
]

export const Layout: FC<{ children: ReactNode }> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const logout = useAuthStore((state) => state.logout)
  const user = useAuthStore((state) => state.user)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-50 font-sans selection:bg-blue-600/30">
      {/* Sidebar - Hidden on Mobile */}
      <aside className="sticky top-0 h-screen w-64 border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl hidden md:flex flex-col transition-all duration-300 z-40">
        <div className="h-16 flex items-center px-6 border-b border-slate-800/60">
          <Truck className="h-6 w-6 text-blue-500 mr-3" />
          <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            TMS Portal
          </span>
        </div>
        
        <nav className="flex-1 w-full flex flex-col gap-2 p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
            Main Menu
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                  isActive
                    ? "text-blue-50 bg-blue-600/10 shadow-[inset_0px_1px_1px_rgba(255,255,255,0.05),0px_1px_2px_rgba(0,0,0,0.5)] border border-blue-500/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                )}
                <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-blue-400" : "group-hover:text-slate-300")} />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Removed old user profile section from sidebar */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 md:px-8 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <Sheet>
              <SheetTrigger asChild>
                <button className="md:hidden text-slate-400 hover:text-white p-2 -ml-2">
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-slate-900 border-r border-slate-800 p-0 text-slate-50">
                <div className="h-16 flex items-center px-6 border-b border-slate-800/60">
                  <Truck className="h-6 w-6 text-blue-500 mr-3" />
                  <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                    TMS Portal
                  </span>
                </div>
                <nav className="w-full flex flex-col gap-2 p-4">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 px-2">
                    Main Menu
                  </div>
                  {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.href || (item.href !== "/" && location.pathname.startsWith(item.href))
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                          isActive
                            ? "text-blue-50 bg-blue-600/10 shadow-[inset_0px_1px_1px_rgba(255,255,255,0.05),0px_1px_2px_rgba(0,0,0,0.5)] border border-blue-500/20"
                            : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50 border border-transparent"
                        )}
                      >
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 rounded-r-full" />
                        )}
                        <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-blue-400" : "group-hover:text-slate-300")} />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </SheetContent>
            </Sheet>
            <h1 className="text-xl font-semibold text-slate-100 hidden sm:block">
              {NAV_ITEMS.find((n) => n.href === location.pathname)?.name || "Dashboard Overview"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative p-2 text-slate-400 hover:text-white transition-colors rounded-full hover:bg-slate-800">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-slate-950 animate-pulse" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-slate-900 border-slate-800 text-slate-200">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-slate-800 focus:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span className="font-medium text-sm text-slate-100">System Update</span>
                  </div>
                  <span className="text-xs text-slate-400">Welcome to TMS v1.1. Role management is now online.</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-slate-800 focus:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-medium text-sm text-slate-100">Vehicle Assigned</span>
                  </div>
                  <span className="text-xs text-slate-400">Chassis C-102 was attached to Truck H-204</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem className="justify-center text-xs text-blue-400 hover:text-blue-300 focus:text-blue-300 cursor-pointer">
                  Mark all as read
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* User Profile */}
            <div className="flex items-center gap-4 pl-4 border-l border-slate-800">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-slate-200">{user?.name || 'Administrator'}</span>
                <span className="text-xs text-slate-500">{user?.roleId ? 'Admin role' : 'Super Admin'}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <button 
                onClick={handleLogout}
                className="ml-2 p-2 rounded-full hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                title="Log out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8 z-10">
          {children}
        </div>
      </main>
    </div>
  )
}
