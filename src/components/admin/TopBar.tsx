"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, Menu } from "lucide-react";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/events": "Events",
  "/admin/themes": "Themes",
  "/admin/form-schemas": "Forms",
  "/admin/registrations": "Registrations",
  "/admin/users": "Users",
  "/admin/messages": "Messages",
  "/admin/cms": "Content",
  "/admin/team": "Team",
  "/admin/settings": "Settings",
  "/admin/audit": "Audit Log",
  "/admin/system": "System Health",
};

function getTitle(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  const base = Object.keys(TITLES)
    .filter((k) => k !== "/admin" && pathname.startsWith(k))
    .sort((a, b) => b.length - a.length)[0];
  return (base && TITLES[base]) ? TITLES[base]! : "Admin";
}

export default function TopBar({ onToggleMobile }: { onToggleMobile?: () => void }) {
  const pathname = usePathname();
  return (
    <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-3 sm:px-6 bg-[#06060a]/90 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobile}
          className="lg:hidden p-2 rounded-lg bg-white/[0.04] text-white/70 hover:text-white hover:bg-white/[0.08] transition-all"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-white font-semibold text-sm sm:text-base">{getTitle(pathname)}</h1>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all">
          <Search className="w-4 h-4" />
        </button>
        <button className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.04] transition-all">
          <Bell className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
