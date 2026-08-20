"use client";

import { useState, useEffect, useCallback, Suspense, useRef, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Download, Eye, CheckCircle2, XCircle, RefreshCw, ChevronLeft, ChevronRight,
  ArrowLeft, Search, Layers, Clock, Users, ArrowRight, Globe, FileEdit, Archive, ShieldAlert,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EventDoc {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  startsAt?: string;
  venue?: string;
  summary?: string;
  registration?: {
    enabled?: boolean;
    fee?: number;
    requiresPayment?: boolean;
    formSchemaId?: string;
  };
}

interface Registration {
  _id: string;
  eventId?: { _id: string; title: string; slug: string } | null;
  squadName: string;
  domain: string;
  leader: { fullName: string; email: string; phone: string; college: string };
  members: { fullName: string; email: string }[];
  transactionId: string;
  status: "pending" | "approved" | "rejected" | "waitlisted";
  payment: { status: string; note?: string };
  formData?: Record<string, unknown>;
  createdAt: string;
  hasScreenshot?: boolean;
}

interface EventStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  waitlisted: number;
}

interface RegStatsResponse {
  byEvent: Record<string, EventStats>;
  grandTotal: number;
  grandPending: number;
  grandApproved: number;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  approved: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  rejected: "bg-red-500/10 text-red-300 border-red-500/20",
  waitlisted: "bg-blue-500/10 text-blue-300 border-blue-500/20",
};

const STATUSES = ["all", "pending", "approved", "rejected", "waitlisted"];

const EVENT_STATUS_META: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  published: { label: "Published", icon: Globe, cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  draft: { label: "Draft", icon: FileEdit, cls: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  archived: { label: "Archived", icon: Archive, cls: "bg-white/5 text-white/40 border-white/10" },
};

function InspectionModal({ reg, onClose, onAction }: {
  reg: Registration;
  onClose: () => void;
  onAction: (id: string, action: string, note?: string) => Promise<void>;
}) {
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState("");
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [imgLoading, setImgLoading] = useState(true);

  useEffect(() => {
    let createdUrl: string | null = null;
    setImgLoading(true);
    fetch(`/api/admin/screenshot/${reg._id}`)
      .then((r) => r.blob())
      .then((b) => {
        createdUrl = URL.createObjectURL(b);
        setImgUrl(createdUrl);
      })
      .catch(() => setImgUrl(null))
      .finally(() => setImgLoading(false));
    return () => {
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [reg._id]);

  const act = async (action: string) => {
    setBusy(action);
    await onAction(reg._id, action, note || undefined);
    setBusy("");
    onClose();
  };

  const eventTitle = typeof reg.eventId === "object" && reg.eventId?.title ? reg.eventId.title : "General Registration";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md" onClick={onClose}>
      <div
        className="bg-[#0f0f18] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/[0.06]">
          <div>
            <h3 className="text-white font-semibold text-base">{reg.squadName}</h3>
            <p className="text-white/40 text-xs mt-0.5 font-mono">{reg._id}</p>
          </div>
          <span className={cn("px-2.5 py-1 rounded-md text-xs border font-medium capitalize", STATUS_STYLES[reg.status] || "text-white/50 border-white/10")}>
            {reg.status}
          </span>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
            <div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1.5">Team Leader</p>
              <p className="text-white font-medium">{reg.leader.fullName}</p>
              <p className="text-white/60 text-xs mt-0.5">{reg.leader.email}</p>
              <p className="text-white/60 text-xs">{reg.leader.phone}</p>
              <p className="text-white/40 text-xs mt-1 italic">{reg.leader.college}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1.5">Event & Details</p>
              <p className="text-violet-300 font-medium">{eventTitle}</p>
              <p className="text-white/60 text-xs mt-0.5">Domain: {reg.domain}</p>
              <p className="text-white/40 font-mono text-xs mt-1">Tx ID: {reg.transactionId}</p>
              <p className="text-white/40 text-xs mt-1">{new Date(reg.createdAt).toLocaleString("en-IN")}</p>
            </div>
          </div>

          {reg.formData && Object.keys(reg.formData).length > 0 && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <p className="text-violet-400 text-xs font-semibold uppercase tracking-wider mb-2">
                Form Responses ({Object.keys(reg.formData).length} Fields)
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(reg.formData).map(([k, v]) => (
                  <div key={k} className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-2.5">
                    <p className="text-white/40 text-[10px] font-mono uppercase tracking-wider">{k.replace(/_/g, " ")}</p>
                    <p className="text-white font-medium text-xs mt-0.5 break-words">{String(v ?? "—")}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {reg.members.length > 0 && (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">Team Members ({reg.members.length})</p>
              <div className="space-y-1.5">
                {reg.members.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.04] last:border-0">
                    <span className="text-white/70 font-medium">{m.fullName}</span>
                    <span className="text-white/40 font-mono">{m.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">Payment Verification Screenshot</p>
            {imgLoading ? (
              <div className="h-48 bg-white/[0.04] rounded-xl animate-pulse flex items-center justify-center">
                <span className="text-white/20 text-sm">Loading screenshot…</span>
              </div>
            ) : imgUrl ? (
              <div className="bg-black/50 border border-white/[0.08] rounded-xl p-2 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgUrl} alt="Payment Proof" className="max-h-72 object-contain rounded-lg" />
              </div>
            ) : (
              <div className="h-24 bg-white/[0.04] border border-white/[0.06] rounded-xl flex items-center justify-center text-white/30 text-sm">
                No screenshot uploaded
              </div>
            )}
          </div>

          {reg.status === "pending" && (
            <div>
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-2">
                Admin Review Note / Rejection Reason (sent to applicant via email)
              </p>
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="E.g. Reason for rejection (e.g. Invalid Transaction ID, blurry screenshot) or approval note…"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50"
              />
            </div>
          )}

          {reg.status === "pending" && (
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => act("approve")}
                disabled={!!busy}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 text-emerald-300 text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-emerald-950/20"
              >
                <CheckCircle2 className="w-4 h-4" />
                {busy === "approve" ? "Approving…" : "Approve Registration"}
              </button>
              <button
                onClick={() => act("reject")}
                disabled={!!busy}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-red-950/20"
              >
                <XCircle className="w-4 h-4" />
                {busy === "reject" ? "Rejecting…" : "Reject Registration"}
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

  const [events, setEvents] = useState<EventDoc[]>([]);
  const [stats, setStats] = useState<RegStatsResponse | null>(null);
  const [items, setItems] = useState<Registration[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Registration | null>(null);
  const [exporting, setExporting] = useState(false);

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get("search") || "");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const eventId = searchParams.get("eventId");
  const viewMode = searchParams.get("view") || (eventId ? "details" : "overview");
  const status = searchParams.get("status") || "all";
  const page = Number(searchParams.get("page") || "1");
  const PAGE_SIZE = 20;

  // Handle live search debounce
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 350);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [searchInput]);

  const selectedEventObj = events.find((e) => e._id === eventId);
  const [schemaFields, setSchemaFields] = useState<{ key: string; label: string }[]>([]);

  useEffect(() => {
    if (selectedEventObj?.registration?.formSchemaId) {
      fetch(`/api/admin/form-schemas/${selectedEventObj.registration.formSchemaId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.data?.fields?.length) {
            setSchemaFields(d.data.fields.map((f: { key: string; label: string }) => ({ key: f.key, label: f.label })));
          } else {
            setSchemaFields([]);
          }
        })
        .catch(() => setSchemaFields([]));
    } else {
      setSchemaFields([]);
    }
  }, [selectedEventObj]);

  const activeColumns = useMemo(() => {
    if (schemaFields.length > 0) {
      return schemaFields;
    }
    const firstFormData = items[0]?.formData;
    if (items.length > 0 && firstFormData && Object.keys(firstFormData).length > 0) {
      const keys = Object.keys(firstFormData).filter((k) => k !== "eventId");
      return keys.map((k) => ({ key: k, label: k.replace(/_/g, " ") }));
    }
    return [
      { key: "squadName", label: "Squad / Team Name" },
      { key: "domain", label: "Domain" },
      { key: "leader.fullName", label: "Leader Name" },
      { key: "leader.email", label: "Email" },
    ];
  }, [schemaFields, items]);

  // Sync debounced search to URL query only when value actually changes
  useEffect(() => {
    if (viewMode === "details") {
      const currentSearch = searchParams.get("search") || "";
      if (debouncedSearch !== currentSearch) {
        const p = new URLSearchParams(searchParams.toString());
        if (debouncedSearch) p.set("search", debouncedSearch);
        else p.delete("search");
        p.set("page", "1");
        router.push(`/admin/registrations?${p.toString()}`);
      }
    }
  }, [debouncedSearch, viewMode, router, searchParams]);

  // Load events & stats for Overview Grid
  const loadDashboardData = useCallback(async () => {
    setEventsLoading(true);
    try {
      const [eRes, sRes] = await Promise.all([
        fetch("/api/admin/events"),
        fetch("/api/admin/registrations/stats"),
      ]);
      if (eRes.ok) {
        const eData = await eRes.json();
        setEvents(eData.data || []);
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        setStats(sData.data || null);
      }
    } catch {
      // Ignore initial stats load fail
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Load registrations table data for Details View
  const loadRegistrations = useCallback(async () => {
    if (viewMode !== "details") return;
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (eventId && eventId !== "all") params.set("eventId", eventId);
      if (status !== "all") params.set("status", status);
      if (debouncedSearch) params.set("search", debouncedSearch);
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));

      const res = await fetch(`/api/admin/registrations?${params}`);
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed");
      setItems(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load registrations");
    } finally {
      setLoading(false);
    }
  }, [viewMode, eventId, status, debouncedSearch, page]);

  useEffect(() => {
    loadRegistrations();
  }, [loadRegistrations]);

  const setParam = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams.toString());
    p.set(key, val);
    if (key !== "page") p.set("page", "1");
    router.push(`/admin/registrations?${p.toString()}`);
  };

  const openEventDetails = (targetEventId?: string) => {
    const p = new URLSearchParams();
    p.set("view", "details");
    if (targetEventId) p.set("eventId", targetEventId);
    else p.set("eventId", "all");
    p.set("page", "1");
    router.push(`/admin/registrations?${p.toString()}`);
  };

  const backToOverview = () => {
    setSearchInput("");
    setDebouncedSearch("");
    router.push("/admin/registrations?view=overview");
  };

  const handleAction = async (id: string, action: string, note?: string) => {
    const res = await fetch(`/api/admin/registrations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, note }),
    });
    if (res.ok) {
      loadRegistrations();
      loadDashboardData();
    }
  };

  const exportXlsx = async () => {
    setExporting(true);
    const params = new URLSearchParams();
    if (eventId && eventId !== "all") params.set("eventId", eventId);
    if (status !== "all") params.set("status", status);
    const res = await fetch(`/api/admin/export?${params}`);
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `registrations_${eventId || "all"}_${Date.now()}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    }
    setExporting(false);
  };

  const currentEventTitle = selectedEventObj ? selectedEventObj.title : (eventId === "all" ? "All Platform Events" : "Event Registrations");
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // =========================================================================
  // VIEW MODE 1: DASHBOARD OVERVIEW GRID
  // =========================================================================
  if (viewMode === "overview") {
    return (
      <div className="space-y-6 max-w-7xl">
        {/* Hub Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-violet-400" />
              Event Registrations Hub
            </h1>
            <p className="text-sm text-white/40 mt-1">Select an event below to manage, review, and export squad registrations</p>
          </div>
          <button
            onClick={() => loadDashboardData()}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl transition-all"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", eventsLoading && "animate-spin")} />
            Refresh Hub
          </button>
        </div>

        {/* Global Summary Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 font-medium">Total Registrations</p>
              <p className="text-2xl font-bold text-white mt-1">{stats?.grandTotal ?? "…"}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center text-violet-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 font-medium">Pending Approvals</p>
              <p className="text-2xl font-bold text-amber-300 mt-1">{stats?.grandPending ?? "…"}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-white/40 font-medium">Approved Squads</p>
              <p className="text-2xl font-bold text-emerald-300 mt-1">{stats?.grandApproved ?? "…"}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Event Cards Grid */}
        <div className="space-y-3">
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-wider">Select Event to Manage</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Master Card: All Events */}
            <div
              onClick={() => openEventDetails("all")}
              className="group relative bg-gradient-to-b from-violet-900/20 to-violet-950/30 border border-violet-500/30 hover:border-violet-500/50 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 shadow-xl shadow-violet-950/20 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Master View
                  </span>
                  <ArrowRight className="w-4 h-4 text-violet-400 group-hover:translate-x-1 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-violet-200 transition-colors">
                  All Events Combined
                </h3>
                <p className="text-xs text-white/40 mt-1">Master list of registrations across all created events</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="text-white/60 font-medium">{stats?.grandTotal ?? 0} Squads Total</span>
                {(stats?.grandPending ?? 0) > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                    {stats?.grandPending} Pending
                  </span>
                )}
              </div>
            </div>

            {/* Individual Event Cards */}
            {eventsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-48 bg-white/[0.02] border border-white/[0.06] rounded-2xl animate-pulse" />
              ))
            ) : events.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white/[0.02] border border-white/[0.06] rounded-2xl text-white/30 text-sm">
                No events created yet. Create an event under Events admin menu first.
              </div>
            ) : (
              events.map((ev) => {
                const sm = EVENT_STATUS_META[ev.status] ?? EVENT_STATUS_META.draft!;
                const Icon = sm.icon;
                const eStats = stats?.byEvent[ev._id] ?? { total: 0, pending: 0, approved: 0 };

                return (
                  <div
                    key={ev._id}
                    onClick={() => openEventDetails(ev._id)}
                    className="group bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/15 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={cn("px-2 py-0.5 rounded-md text-xs border flex items-center gap-1 font-medium", sm.cls)}>
                          <Icon className="w-3 h-3" />
                          {sm.label}
                        </span>
                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/80 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="text-lg font-semibold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                        {ev.title}
                      </h3>
                      <p className="text-xs text-white/30 font-mono mt-0.5">/{ev.slug}</p>
                      {ev.venue && <p className="text-xs text-white/40 mt-2 truncate">📍 {ev.venue}</p>}
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-violet-500/10 text-violet-300 rounded-md border border-violet-500/20 font-medium">
                          {eStats.total} Registrations
                        </span>
                      </div>
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        {ev.registration?.formSchemaId ? (
                          <a
                            href={`/admin/form-schemas/${ev.registration.formSchemaId}/edit`}
                            className="px-2 py-1 rounded bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all text-[11px] font-medium"
                            title="Edit Custom Form Schema"
                          >
                            ✏️ Form Schema
                          </a>
                        ) : (
                          <a
                            href={`/admin/form-schemas/new`}
                            className="px-2 py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/40 hover:text-white/70 transition-all text-[11px]"
                            title="Create Custom Form Schema"
                          >
                            ＋ New Form
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW MODE 2: PER-EVENT REGISTRATIONS DRILL-DOWN PAGE
  // =========================================================================
  return (
    <div className="space-y-5 max-w-7xl">
      {/* Drill-down Navigation Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <button
            onClick={backToOverview}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/70 hover:text-white text-xs font-medium transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Events Hub
          </button>
          <div className="h-4 w-px bg-white/10" />
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              {currentEventTitle}
              {selectedEventObj && (
                <span className={cn("px-2 py-0.5 rounded-md text-xs border font-medium", EVENT_STATUS_META[selectedEventObj.status]?.cls)}>
                  {EVENT_STATUS_META[selectedEventObj.status]?.label}
                </span>
              )}
            </h1>
            <p className="text-xs text-white/40 mt-0.5">Manage squad registrations, approve payments, and view team details</p>
          </div>
        </div>

        {/* Quick Event Switcher & Form Schema Editor Button */}
        <div className="flex items-center gap-3">
          {selectedEventObj && (
            selectedEventObj.registration?.formSchemaId ? (
              <a
                href={`/admin/form-schemas/${selectedEventObj.registration.formSchemaId}/edit`}
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-300 text-xs font-medium transition-all"
              >
                <FileEdit className="w-3.5 h-3.5" />
                Edit Form Schema
              </a>
            ) : (
              <a
                href="/admin/form-schemas/new"
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white text-xs font-medium transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Create Custom Form
              </a>
            )
          )}
          <div className="flex items-center gap-2">
            <label className="text-xs text-white/40 font-medium">Switch Event:</label>
            <select
              value={eventId || "all"}
              onChange={(e) => openEventDetails(e.target.value)}
              className="bg-white/[0.05] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-violet-500/50 [&>option]:bg-zinc-900 cursor-pointer"
            >
              <option value="all">-- All Events Combined --</option>
              {events.map((ev) => (
                <option key={ev._id} value={ev._id}>
                  {ev.title} ({stats?.byEvent[ev._id]?.total ?? 0})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Control Bar: Search, Status Filters & Export */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full sm:w-auto sm:flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 pointer-events-none" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search registrations…"
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/20 outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 overflow-x-auto max-w-full">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setParam("status", s)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize whitespace-nowrap",
                status === s ? "bg-white/10 text-white font-semibold shadow" : "text-white/40 hover:text-white/70"
              )}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={loadRegistrations}
            className="p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-white/40 hover:text-white/80 transition-all"
            title="Refresh"
          >
            <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          </button>
          <button
            onClick={exportXlsx}
            disabled={exporting}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/25 text-violet-300 transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {exporting ? "Exporting…" : "Export Excel"}
          </button>
        </div>
      </div>

      <div className="text-xs text-white/30">{total} registration{total !== 1 ? "s" : ""} found</div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">{error}</div>}

      {/* Dynamic Registrations Table */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                {(eventId === "all" || !eventId) && (
                  <th className="px-4 py-3.5 text-left text-xs font-medium text-white/30 uppercase tracking-wider">Event</th>
                )}
                {activeColumns.map((col) => (
                  <th key={col.key} className="px-4 py-3.5 text-left text-xs font-medium text-white/30 uppercase tracking-wider">
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-3.5 text-left text-xs font-medium text-white/30 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-white/30 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3.5 text-left text-xs font-medium text-white/30 uppercase tracking-wider">Inspect</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    <td colSpan={activeColumns.length + 4} className="px-4 py-3.5">
                      <div className="h-4 bg-white/[0.04] rounded animate-pulse w-full" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={activeColumns.length + 4} className="px-4 py-16 text-center text-white/30">
                    <ShieldAlert className="w-8 h-8 text-white/10 mx-auto mb-2" />
                    No registrations found matching criteria
                  </td>
                </tr>
              ) : (
                items.map((r) => {
                  const evTitle = typeof r.eventId === "object" && r.eventId?.title ? r.eventId.title : null;
                  return (
                    <tr key={r._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      {(eventId === "all" || !eventId) && (
                        <td className="px-4 py-3.5 text-white/80 text-xs">
                          {evTitle ? (
                            <span className="px-2 py-0.5 bg-violet-500/10 text-violet-300 rounded border border-violet-500/20 font-medium">
                              {evTitle}
                            </span>
                          ) : (
                            <span className="text-white/30 italic">General</span>
                          )}
                        </td>
                      )}
                      {activeColumns.map((col) => {
                        let val: unknown = r.formData?.[col.key];
                        if (val === undefined || val === "") {
                          if (col.key === "squadName") val = r.squadName !== "Squad" ? r.squadName : "";
                          else if (col.key === "domain") val = r.domain;
                          else if (col.key === "leader.fullName") val = r.leader?.fullName !== "Participant" ? r.leader?.fullName : "";
                          else if (col.key === "leader.email") val = r.leader?.email !== "no-email@registration.local" ? r.leader?.email : "";
                          else if (col.key === "transactionId") val = r.transactionId;
                        }
                        return (
                          <td key={col.key} className="px-4 py-3.5 text-white/80 text-xs font-medium max-w-[220px] truncate">
                            {String(val || "—")}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3.5">
                        <span className={cn("px-2 py-0.5 rounded-md text-xs border font-medium capitalize", STATUS_STYLES[r.status] || "text-white/50 border-white/10")}>
                          {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-white/30 text-xs whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          onClick={() => setSelected(r)}
                          className="p-1.5 rounded-lg text-white/30 hover:text-violet-300 hover:bg-violet-500/10 transition-all"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
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
        <InspectionModal reg={selected} onClose={() => setSelected(null)} onAction={handleAction} />
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
