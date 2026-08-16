"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Users, CalendarDays, ClipboardList, CheckCircle2, Clock, XCircle,
  TrendingUp, ArrowRight, RefreshCw, Database, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Health {
  db: { connected: boolean };
  counts: { registrations: number; events: number; users: number; content: number };
  uptimeSeconds: number;
  node: string;
  timestamp: string;
}

interface RegSummary {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  sub?: string;
  href?: string;
}

function StatCard({ label, value, icon: Icon, color, sub, href }: StatCardProps) {
  const inner = (
    <div className={cn(
      "group relative bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-200",
      href && "cursor-pointer"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", color)}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {href && <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />}
      </div>
      <p className="text-3xl font-bold text-white mb-1">{value}</p>
      <p className="text-sm text-white/50">{label}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-white/[0.04] rounded-xl", className)} />;
}

export default function AdminDashboard() {
  const [health, setHealth] = useState<Health | null>(null);
  const [regs, setRegs] = useState<RegSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [hRes, rRes, pRes, aRes, xRes] = await Promise.all([
        fetch("/api/admin/system/health"),
        fetch("/api/admin/registrations?limit=1"),
        fetch("/api/admin/registrations?status=pending&limit=1"),
        fetch("/api/admin/registrations?status=approved&limit=1"),
        fetch("/api/admin/registrations?status=rejected&limit=1"),
      ]);
      if (hRes.status === 401) { window.location.href = "/admin/login"; return; }
      const hData = await hRes.json();
      if (!hRes.ok) throw new Error(hData?.error?.message || "Failed to load health");
      setHealth(hData.data);
      if (rRes.ok) {
        const [rD, pD, aD, xD] = await Promise.all([rRes.json(), pRes.json(), aRes.json(), xRes.json()]);
        setRegs({
          total: rD.meta?.total ?? 0,
          pending: pD.meta?.total ?? 0,
          approved: aD.meta?.total ?? 0,
          rejected: xD.meta?.total ?? 0,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const uptimeHours = health ? Math.floor(health.uptimeSeconds / 3600) : 0;

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white">Overview</h2>
          <p className="text-sm text-white/40 mt-0.5">Real-time platform stats</p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-white/50 hover:text-white/80 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-lg transition-all"
        >
          <RefreshCw className={cn("w-3.5 h-3.5", refreshing && "animate-spin")} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">{error}</div>
      )}

      {!loading && health && (
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border",
          health.db.connected
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300"
            : "bg-red-500/10 border-red-500/20 text-red-300"
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", health.db.connected ? "bg-emerald-400" : "bg-red-400")} />
          <Database className="w-3 h-3" />
          {health.db.connected ? "Database connected" : "Database disconnected"}
          <span className="ml-2 text-white/20">·</span>
          <Zap className="w-3 h-3 text-white/30" />
          <span className="text-white/40">Node {health.node}</span>
          <span className="ml-1 text-white/30">· Up {uptimeHours}h</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-36" />)
        ) : (
          <>
            <StatCard label="Total Registrations" value={regs?.total ?? health?.counts.registrations ?? 0} icon={ClipboardList} color="bg-violet-500/20" href="/admin/registrations" />
            <StatCard label="Pending Review" value={regs?.pending ?? 0} icon={Clock} color="bg-amber-500/20" sub="Needs attention" href="/admin/registrations?status=pending" />
            <StatCard label="Approved" value={regs?.approved ?? 0} icon={CheckCircle2} color="bg-emerald-500/20" href="/admin/registrations?status=approved" />
            <StatCard label="Rejected" value={regs?.rejected ?? 0} icon={XCircle} color="bg-red-500/20" href="/admin/registrations?status=rejected" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28" />)
        ) : (
          <>
            <StatCard label="Events" value={health?.counts.events ?? 0} icon={CalendarDays} color="bg-indigo-500/20" href="/admin/events" />
            <StatCard label="Users" value={health?.counts.users ?? 0} icon={Users} color="bg-pink-500/20" href="/admin/team" />
            <StatCard label="CMS Content" value={health?.counts.content ?? 0} icon={TrendingUp} color="bg-teal-500/20" href="/admin/cms" />
          </>
        )}
      </div>

      <div>
        <h3 className="text-xs font-semibold text-white/40 mb-3 uppercase tracking-wider">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { href: "/admin/events/new", label: "New Event" },
            { href: "/admin/registrations?status=pending", label: "Review Pending" },
            { href: "/admin/cms", label: "Edit Content" },
            { href: "/admin/audit", label: "View Audit Log" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="flex items-center justify-between px-4 py-3 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/10 rounded-xl text-sm text-white/60 hover:text-white transition-all group"
            >
              {a.label}
              <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/50 transition-colors" />
            </Link>
          ))}
        </div>
      </div>

      {health && (
        <p className="text-xs text-white/20">Last checked: {new Date(health.timestamp).toLocaleString("en-IN")}</p>
      )}
    </div>
  );
}
