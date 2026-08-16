"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import type { Role } from "@/config/roles";
import { cn } from "@/lib/utils";

export default function AdminShell({
  role,
  name,
  children,
}: {
  role: Role;
  name: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#06060a] text-white flex relative overflow-x-hidden">
      {/* Fixed Sidebar */}
      <Sidebar
        role={role}
        name={name}
        collapsed={collapsed}
        onCollapse={setCollapsed}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 w-full",
          collapsed ? "lg:pl-16" : "lg:pl-60"
        )}
      >
        <TopBar onToggleMobile={() => setMobileOpen((o) => !o)} />
        <main className="flex-1 overflow-x-hidden p-3 sm:p-5 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
