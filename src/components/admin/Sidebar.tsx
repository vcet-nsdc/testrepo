"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  FileText,
  Users,
  UserCog,
  Settings,
  Activity,
  Server,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
  Mail,
  Layers,
  WrapText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Roles, type Role } from "@/config/roles";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: Role[];
  badge?: string;
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, roles: [Roles.FACULTY_ADMIN, Roles.DEVELOPER_ADMIN] },
  { href: "/admin/events", label: "Events", icon: CalendarDays, roles: [Roles.FACULTY_ADMIN, Roles.DEVELOPER_ADMIN] },
  { href: "/admin/themes", label: "Themes", icon: Layers, roles: [Roles.FACULTY_ADMIN] },
  { href: "/admin/form-schemas", label: "Forms", icon: WrapText, roles: [Roles.FACULTY_ADMIN] },
  { href: "/admin/registrations", label: "Registrations", icon: ClipboardList, roles: [Roles.FACULTY_ADMIN, Roles.DEVELOPER_ADMIN] },
  { href: "/admin/users", label: "Users", icon: UserCog, roles: [Roles.FACULTY_ADMIN] },
  { href: "/admin/messages", label: "Messages", icon: Mail, roles: [Roles.FACULTY_ADMIN, Roles.DEVELOPER_ADMIN] },
  { href: "/admin/cms", label: "Content", icon: FileText, roles: [Roles.FACULTY_ADMIN] },
  { href: "/admin/team", label: "Team", icon: Users, roles: [Roles.FACULTY_ADMIN] },
  { href: "/admin/settings", label: "Settings", icon: Settings, roles: [Roles.FACULTY_ADMIN] },
  { href: "/admin/audit", label: "Audit Log", icon: Activity, roles: [Roles.FACULTY_ADMIN, Roles.DEVELOPER_ADMIN] },
  { href: "/admin/system", label: "System", icon: Server, roles: [Roles.FACULTY_ADMIN, Roles.DEVELOPER_ADMIN] },
];

interface SidebarProps {
  role: Role;
  name: string;
  onCollapse?: (collapsed: boolean) => void;
}

export default function Sidebar({ role, name, onCollapse }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const allowed = NAV.filter((n) => n.roles.includes(role));
  const isFaculty = role === Roles.FACULTY_ADMIN;

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-full flex flex-col bg-[#0a0a0f] border-r border-white/[0.06] transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-16 border-b border-white/[0.06] px-4 gap-3", collapsed && "justify-center px-0")}>
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white font-bold text-xs">NS</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-tight truncate">NSDC VCET</p>
            <p className="text-white/40 text-[10px] uppercase tracking-widest">Admin</p>
          </div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium",
            isFaculty
              ? "bg-violet-500/10 text-violet-300 border border-violet-500/20"
              : "bg-sky-500/10 text-sky-300 border border-sky-500/20"
          )}>
            {isFaculty ? <Shield className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
            {isFaculty ? "Faculty Admin" : "Developer"}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {allowed.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                active
                  ? "bg-violet-500/15 text-violet-300"
                  : "text-white/50 hover:text-white/90 hover:bg-white/[0.04]",
                collapsed && "justify-center px-0"
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-400 rounded-full" />
              )}
              <Icon className={cn("w-4 h-4 flex-shrink-0", active ? "text-violet-400" : "text-white/40 group-hover:text-white/70")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-white/[0.06] p-2 space-y-0.5">
        {!collapsed && (
          <div className="px-3 py-2">
            <p className="text-white/80 text-sm font-medium truncate">{name}</p>
            <p className="text-white/30 text-xs truncate">{isFaculty ? "Full Access" : "Dev Access"}</p>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-150",
            collapsed && "justify-center px-0"
          )}
          title={collapsed ? "Sign out" : undefined}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && "Sign Out"}
        </button>
        <button
          onClick={() => { setCollapsed((c) => { const next = !c; onCollapse?.(next); return next; }); }}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all duration-150",
            collapsed && "justify-center px-0"
          )}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && "Collapse"}
        </button>
      </div>
    </aside>
  );
}
