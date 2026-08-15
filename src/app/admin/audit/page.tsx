"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuditItem {
  _id: string;
  action: string;
  actorRole: string;
  resource: { type: string; id?: string };
  ip?: string;
  createdAt: string;
}

const ACTION_COLORS: Record<string, string> = {
  "event.create": "text-emerald-300",
  "event.update": "text-blue-300",
  "event.delete": "text-red-300",
  "cms.publish": "text-teal-300",
  "cms.rollback": "text-amber-300",
  "settings.business.update": "text-violet-300",
  "settings.technical.update": "text-violet-300",
};

export default function AuditPage() {
  const [items, setItems] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 50;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/audit?page=${page}&limit=${PAGE_SIZE}`);
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Failed to load");
      setItems(json.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load audit log");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">Immutable action trail. All admin operations are logged.</p>
        <button onClick={load} className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-white/40 hover:text-white/80 transition-all">
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">{error}</div>}

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Action", "Role", "Resource", "IP", "Time"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-white/[0.04] rounded animate-pulse" style={{ width: `${50 + (j * 20) % 50}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-16 text-center">
                    <Shield className="w-8 h-8 text-white/10 mx-auto mb-2" />
                    <p className="text-white/30 text-sm">No audit entries yet</p>
                  </td>
                </tr>
              ) : (
                items.map((it) => (
                  <tr key={it._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <span className={cn("font-mono text-xs", ACTION_COLORS[it.action] || "text-white/60")}>{it.action}</span>
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs uppercase">{it.actorRole?.replace("_ADMIN", "")}</td>
                    <td className="px-4 py-3 text-white/40 text-xs">
                      {it.resource?.type}{it.resource?.id ? <span className="text-white/20">:{it.resource.id.slice(-6)}</span> : null}
                    </td>
                    <td className="px-4 py-3 text-white/30 text-xs font-mono">{it.ip || "—"}</td>
                    <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">
                      {new Date(it.createdAt).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {items.length === PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/30">Page {page}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/80 disabled:opacity-30 transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage((p) => p + 1)} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/80 transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
