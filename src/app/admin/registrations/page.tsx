"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Filter, Download, Eye, CheckCircle2, XCircle, RefreshCw, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Registration {
  _id: string;
  squadName: string;
  domain: string;
  leader: { fullName: string; email: string; phone: string; college: string };
  members: { fullName: string; email: string }[];
  transactionId: string;
  status: "pending" | "approved" | "rejected" | "waitlisted";
  payment: { status: string; note?: string };
  createdAt: string;
  hasScreenshot?: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-300 border-red-500/20",
  waitlisted: "bg-blue-500/10 text-blue-300 border-blue-500/20",
};

const DOMAINS = ["all", "ai", "vibeathon", "uiux"];
const STATUSES = ["all", "pending", "approved", "rejected", "waitlisted"];

function Modal({ reg, onClose, onAction }: {
  reg: Registration;
  onClose: () => void;
  onAction: (id: string, action: string, note?: string) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    setImgLoading(true);
    fetch(`/api/admin/screenshot/${reg._id}`)
      .then((r) => r.blob())
      .then((b) => setImgUrl(URL.createObjectURL(b)))
      .catch(() => setImgUrl(null))
      .finally(() => setImgLoading(false));
    return () => { if (imgUrl) URL.revokeObjectURL(imgUrl); };
  }, [reg._id]);

  const act = async (action: string) => {
    setBusy(action);
    await onAction(reg._id, action, note || undefined);
    setBusy("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0f0f18] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div>
            <h3 className="text-white font-semibold">{reg.squadName}</h3>
            <p className="text-white/40 text-xs mt-0.5">{reg._id}</p>
          </div>
          <span className={cn("px-2 py-0.5 rounded-md text-xs border", STATUS_STYLES[reg.status] || "text-white/50 border-white/10")}>
            {reg.status}
          </span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-white/40 text-xs mb-1">Leader</p>
              <p className="text-white font-medium">{reg.leader.fullName}</p>
              <p className="text-white/50">{reg.leader.email}</p>
              <p className="text-white/50">{reg.leader.phone}</p>
              <p className="text-white/40 text-xs">{reg.leader.college}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs mb-1">Domain & Transaction</p>
              <p className="text-white font-medium">{reg.domain}</p>
              <p className="text-white/50 font-mono text-xs">{reg.transactionId}</p>
              <p className="text-white/40 text-xs mt-1">{new Date(reg.createdAt).toLocaleString("en-IN")}</p>
            </div>
          </div>
          {reg.members.length > 0 && (
            <div>
              <p className="text-white/40 text-xs mb-2">Team Members</p>
              <div className="space-y-1">
                {reg.members.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="text-white/60">{m.fullName}</span>
                    <span className="text-white/30 text-xs">{m.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="text-white/40 text-xs mb-2">Payment Screenshot</p>
            {imgLoading ? (
              <div className="h-48 bg-white/[0.04] rounded-xl animate-pulse flex items-center justify-center">
                <span className="text-white/20 text-sm">Loading…</span>
              </div>
            ) : imgUrl ? (
              <img src={imgUrl} alt="Payment" className="w-full max-h-64 object-contain rounded-xl bg-black/40 border border-white/[0.06]" />
            ) : (
              <div className="h-20 bg-white/[0.04] rounded-xl flex items-center justify-center text-white/20 text-sm">No screenshot</div>
            )}
          </div>
          {reg.status === "pending" && (
            <div>
              <p className="text-white/40 text-xs mb-2">Note (optional)</p>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Reason for rejection…"
                className="w-full bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/40"
              />
            </div>
          )}
          {reg.status === "pending" && (
            <div className="flex gap-3">
              <button
                onClick={() => act("approve")}
                disabled={!!busy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/20 text-emerald-300 text-sm font-medium transition-all disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                {busy === "approve" ? "Approving…" : "Approve"}
              </button>
              <button
                onClick={() => act("reject")}
                disabled={!!busy}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/15 hover:bg-red-500/25 border border-red-500/20 text-red-300 text-sm font-medium transition-all disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                {busy === "reject" ? "Rejecting…" : "Reject"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RegistrationsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [items, setItems] = useState<Registration[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Registration | null>(null);
  const [exporting, setExporting] = useState(false);

  const domain = searchParams.get("domain") || "all";
  const status = searchParams.get("status") || "all";
  const page = Number(searchParams.get("page") || "1");
  const PAGE_SIZE = 20;

  const setParam = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set(key, val);
    if (key !== "page") p.set("page", "1");
    router.push(`/admin/registrations?${p.toString()}`);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (domain !== "all") params.set("domain", domain);
      if (status !== "all") params.set("status", status);
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));
      const res = await fetch(`/api/admin/registrations?${params}`);
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed");
      setItems(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [domain, status, page]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async (id: string, action: string, note?: string) => {
    const res = await fetch(`/api/admin/registrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    if (res.ok) load();
  };

  const exportXlsx = async () => {
    setExporting(true);
    const params = new URLSearchParams();
    if (domain !== "all") params.set("domain", domain);
    const res = await fetch(`/api/admin/export?${params}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `registrations_${domain}_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="space-y-5 max-w-7xl">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-1">
          <Filter className="w-3.5 h-3.5 text-white/30 ml-1" />
          {DOMAINS.map((d) => (
            <button
              key={d}
              onClick={() => setParam("domain", d)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                domain === d ? "bg-violet-500/20 text-violet-300" : "text-white/40 hover:text-white/70"
              )}
            >
              {d === "all" ? "All Domains" : d.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-1">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setParam("status", s)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
                status === s ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-white/40 hover:text-white/80 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={exportXlsx}
            disabled={exporting}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/20 text-violet-300 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? "Exporting…" : "Export"}
          </button>
        </div>
      </div>

      <div className="text-xs text-white/30">{total} result{total !== 1 ? "s" : ""}</div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">{error}</div>}

      {/* Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {["Squad", "Domain", "Leader", "College", "Transaction", "Status", "Date", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {Array.from({ length: 8 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-white/[0.04] rounded animate-pulse" style={{ width: `${60 + (j * 13) % 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-white/30">No registrations found</td>
                </tr>
              ) : (
                items.map((r) => (
                  <tr key={r._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{r.squadName}</td>
                    <td className="px-4 py-3 text-white/50 uppercase text-xs">{r.domain}</td>
                    <td className="px-4 py-3">
                      <p className="text-white/80">{r.leader.fullName}</p>
                      <p className="text-white/30 text-xs">{r.leader.email}</p>
                    </td>
                    <td className="px-4 py-3 text-white/40 text-xs max-w-[120px] truncate">{r.leader.college}</td>
                    <td className="px-4 py-3 text-white/40 font-mono text-xs">{r.transactionId}</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 rounded-md text-xs border", STATUS_STYLES[r.status] || "text-white/50 border-white/10")}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(r)}
                        className="p-1.5 rounded-lg text-white/30 hover:text-white/80 hover:bg-white/[0.06] transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-white/30">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setParam("page", String(page - 1))}
              disabled={page <= 1}
              className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/80 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setParam("page", String(page + 1))}
              disabled={page >= totalPages}
              className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/80 disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {selected && (
        <Modal reg={selected} onClose={() => setSelected(null)} onAction={handleAction} />
      )}
    </div>
  );
}

export default function RegistrationsPage() {
  return (
    <Suspense>
      <RegistrationsContent />
    </Suspense>
  );
}
