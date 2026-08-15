"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, CheckCircle2, XCircle, Server, Database, Cpu, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Health {
  db: { connected: boolean };
  counts: { registrations: number; events: number; users: number; content: number };
  uptimeSeconds: number;
  node: string;
  timestamp: string;
}

function MetricCard({ label, value, sub, icon: Icon, accent }: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: string;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className={cn("w-4 h-4", accent || "text-white/30")} />
        <span className="text-xs text-white/40 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-white/30 mt-1">{sub}</p>}
    </div>
  );
}

export default function SystemPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/system/health");
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Failed");
      setHealth(json.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load health");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const uptimeFormatted = health
    ? `${Math.floor(health.uptimeSeconds / 3600)}h ${Math.floor((health.uptimeSeconds % 3600) / 60)}m`
    : "—";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">Live system snapshot</p>
        <button onClick={load} className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-white/40 hover:text-white/80 transition-all">
          <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
        </button>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">{error}</div>}

      {loading && !health ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 bg-white/[0.02] border border-white/[0.06] rounded-xl animate-pulse" />)}
        </div>
      ) : health ? (
        <>
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl border",
            health.db.connected
              ? "bg-emerald-500/[0.07] border-emerald-500/20"
              : "bg-red-500/[0.07] border-red-500/20"
          )}>
            {health.db.connected
              ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              : <XCircle className="w-5 h-5 text-red-400" />}
            <div>
              <p className={cn("font-medium text-sm", health.db.connected ? "text-emerald-300" : "text-red-300")}>
                Database {health.db.connected ? "Connected" : "Disconnected"}
              </p>
              <p className="text-xs text-white/30">MongoDB Atlas</p>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Document Counts</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard label="Registrations" value={health.counts.registrations} icon={Database} accent="text-violet-400" />
              <MetricCard label="Events" value={health.counts.events} icon={Database} accent="text-indigo-400" />
              <MetricCard label="Users" value={health.counts.users} icon={Database} accent="text-pink-400" />
              <MetricCard label="CMS Items" value={health.counts.content} icon={Database} accent="text-teal-400" />
            </div>
          </div>

          <div>
            <h3 className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">Runtime</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <MetricCard label="Uptime" value={uptimeFormatted} icon={Clock} />
              <MetricCard label="Node.js" value={health.node} icon={Cpu} />
              <MetricCard label="Last Check" value={new Date(health.timestamp).toLocaleTimeString("en-IN")} sub={new Date(health.timestamp).toLocaleDateString("en-IN")} icon={Server} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
