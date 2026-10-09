import { Outlet, NavLink, useLocation } from "react-router-dom"
import {
  LayoutDashboard,
  FolderGit2,
  Swords,
  Network,
  Bug,
  ShieldCheck,
  BarChart2,
  FileText,
  Settings,
  Bell,
  Search,
  ChevronDown,
  TerminalSquare,
  ChevronsUpDown,
} from "lucide-react"
import { cn } from "../lib/utils"
import { Badge } from "./ui"

const NAV_GROUPS = [
  {
    name: "Overview",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
      { name: "Projects", path: "/projects", icon: FolderGit2 },
    ],
  },
  {
    name: "Testing",
    items: [
      { name: "Arena", path: "/arena", icon: Swords },
      { name: "Evolution", path: "/evolution", icon: Network },
    ],
  },
  {
    name: "Security",
    items: [
      { name: "Vulnerabilities", path: "/vulnerabilities", icon: Bug, count: 3 },
      { name: "Patches", path: "/patches", icon: ShieldCheck },
    ],
  },
  {
    name: "Insights",
    items: [
      { name: "Benchmarks", path: "/benchmarks", icon: BarChart2 },
      { name: "Reports", path: "/reports", icon: FileText },
    ],
  },
]

export default function Layout() {
  const location = useLocation()

  return (
    <div className="flex h-screen bg-dojo-bg overflow-hidden selection:bg-dojo-accent-muted selection:text-dojo-text-primary font-sans">
      {/* Sidebar */}
      <aside className="w-56 border-r border-dojo-border flex flex-col bg-dojo-panel z-10 shrink-0">
        <div className="h-14 flex items-center px-5 border-b border-dojo-border">
          <div className="flex items-center gap-2 text-dojo-text-primary">
            <TerminalSquare className="w-5 h-5 text-dojo-accent" />
            <span className="font-semibold tracking-tight text-[15px]">
              DOJO
            </span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-5 flex flex-col gap-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.name} className="px-3 flex flex-col gap-1">
              <div className="px-2 pb-1 text-[11px] font-semibold text-dojo-text-tertiary uppercase tracking-wider">
                {group.name}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname.startsWith(item.path)
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center justify-between px-2 py-1.5 rounded-md text-[13px] font-medium transition-colors group",
                      isActive
                        ? "bg-dojo-surface text-dojo-text-primary"
                        : "text-dojo-text-secondary hover:text-dojo-text-primary hover:bg-dojo-surface/50",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={cn(
                          "w-4 h-4",
                          isActive
                            ? "text-dojo-accent"
                            : "text-dojo-text-tertiary group-hover:text-dojo-text-secondary",
                        )}
                      />
                      {item.name}
                    </div>
                    {item.count && (
                      <Badge
                        variant={isActive ? "accent" : "neutral"}
                        className="px-1.5 py-0 min-w-[20px] h-5 flex items-center justify-center rounded-full text-[11px]"
                      >
                        {item.count}
                      </Badge>
                    )}
                  </NavLink>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-dojo-border">
          <NavLink
            to="/settings"
            className={cn(
              "flex items-center gap-2.5 px-2 py-1.5 rounded-md text-[13px] font-medium transition-colors",
              location.pathname.startsWith("/settings")
                ? "bg-dojo-surface text-dojo-text-primary"
                : "text-dojo-text-secondary hover:text-dojo-text-primary hover:bg-dojo-surface/50",
            )}
          >
            <Settings className="w-4 h-4 text-dojo-text-tertiary" />
            Settings
          </NavLink>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-dojo-bg">
        {/* Topbar */}
        <header className="h-14 border-b border-dojo-border bg-dojo-panel flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-4">
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group w-64 hidden sm:block">
              <Search className="w-3.5 h-3.5 text-dojo-text-tertiary absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-dojo-accent transition-colors" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full bg-white border border-dojo-border text-dojo-text-primary placeholder:text-dojo-text-tertiary rounded-md text-[13px] pl-9 pr-3 py-1.5 focus:outline-none focus:border-dojo-accent focus:ring-1 focus:ring-dojo-accent transition-all shadow-sm"
              />
            </div>
            
            <div className="w-px h-5 bg-dojo-border"></div>
            
            <button className="relative text-dojo-text-secondary hover:text-dojo-text-primary transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-dojo-threat border-2 border-white"></span>
            </button>
            
            <div className="w-8 h-8 rounded-full bg-dojo-surface border border-dojo-border flex items-center justify-center text-xs font-semibold text-dojo-text-secondary cursor-pointer hover:bg-dojo-border transition-colors">
              ST
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-8 max-w-[1400px] mx-auto min-h-full">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  )
}
