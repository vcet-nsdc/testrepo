"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, RefreshCw, Calendar, Globe, Archive, FileEdit } from "lucide-react";
import { cn } from "@/lib/utils";

interface Event {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  startsAt?: string;
  venue?: string;
  summary?: string;
  registration: { enabled: boolean; fee: number };
  createdAt: string;
}

const STATUS_META: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
  published: { label: "Published", icon: Globe, cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" },
  draft: { label: "Draft", icon: FileEdit, cls: "bg-amber-500/10 text-amber-300 border-amber-500/20" },
  archived: { label: "Archived", icon: Archive, cls: "bg-white/5 text-white/40 border-white/10" },
};

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<"all" | "draft" | "published" | "archived">("all");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = filterStatus !== "all" ? `?status=${filterStatus}` : "";
      const res = await fetch(`/api/admin/events${params}`);
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed");
      setEvents(data.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const deleteEvent = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (res.ok) setEvents((prev) => prev.filter((e) => e._id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const filtered = filterStatus === "all" ? events : events.filter((e) => e.status === filterStatus);

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-lg p-1">
          {(["all", "published", "draft", "archived"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize",
                filterStatus === s ? "bg-white/10 text-white" : "text-white/40 hover:text-white/70"
              )}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-white/40 hover:text-white/80 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <Link
            href="/admin/events/new"
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-300 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            New Event
          </Link>
        </div>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">{error}</div>}

      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/[0.03] border border-white/[0.06] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center">
          <Calendar className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No events found</p>
          <Link href="/admin/events/new" className="inline-block mt-4 px-4 py-2 text-sm text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-lg transition-all">
            Create first event
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ev) => {
            const sm = STATUS_META[ev.status] ?? STATUS_META.draft!;
            const Icon = sm.icon;
            return (
              <div key={ev._id} className="group flex items-center gap-4 p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/10 rounded-xl transition-all">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", sm.cls.split(" ")[0])}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-medium truncate">{ev.title}</p>
                    <span className={cn("px-2 py-0.5 rounded-md text-xs border flex-shrink-0", sm.cls)}>{sm.label}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-xs text-white/30">
                    <span className="font-mono">/{ev.slug}</span>
                    {ev.startsAt && <span>{new Date(ev.startsAt).toLocaleDateString("en-IN")}</span>}
                    {ev.venue && <span>{ev.venue}</span>}
                    {ev.registration.fee > 0 && <span>₹{ev.registration.fee}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    href={`/admin/events/${ev._id}/edit`}
                    className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => deleteEvent(ev._id, ev.title)}
                    disabled={deleting === ev._id}
                    className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
