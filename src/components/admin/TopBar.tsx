"use client";

import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";

const TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/events": "Events",
  "/admin/registrations": "Registrations",
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

export default function TopBar() {
  const pathname = usePathname();
  return (
    <header className="h-14 border-b border-white/[0.06] flex items-center justify-between px-6">
      <h1 className="text-white font-semibold text-base">{getTitle(pathname)}</h1>
      <div className="flex items-center gap-2">
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
