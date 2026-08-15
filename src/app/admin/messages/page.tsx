"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { Search, Trash2, ChevronLeft, ChevronRight, Phone, Mail } from "lucide-react";
import { Roles } from "@/config/roles";

const inputCls = "w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all";

interface Message { _id: string; name: string; email: string; contact: string; message: string; createdAt: string; }
interface Pag { page: number; limit: number; total: number; totalPages: number; }

export default function MessagesPage() {
  const { data: session } = useSession();
  const isFaculty = session?.user?.role === Roles.FACULTY_ADMIN;

  const [items, setItems] = useState<Message[]>([]);
  const [pag, setPag] = useState<Pag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const p = new URLSearchParams({ page: String(page), limit: "20" });
      if (debouncedSearch) p.set("search", debouncedSearch);
      const res = await fetch(`/api/admin/messages?${p}`);
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Failed");
      setItems(json.data || []); setPag(json.pagination || null);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load"); }
    finally { setLoading(false); }
  }, [page, debouncedSearch]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message permanently?")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      if (res.ok) { setItems((prev) => prev.filter((m) => m._id !== id)); if (expanded === id) setExpanded(null); }
      else { const json = await res.json(); alert(json?.error?.message || "Delete failed"); }
    } finally { setDeleting(null); }
  };

  const totalPages = pag?.totalPages ?? 1;

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 pointer-events-none" />
        <input className={inputCls + " pl-9"} placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {pag && <p className="text-xs text-white/30">{pag.total} message{pag.total !== 1 ? "s" : ""}</p>}
      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">{error}</div>}

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-white/[0.05] rounded w-1/3 mb-2" /><div className="h-3 bg-white/[0.04] rounded w-1/2 mb-3" /><div className="h-3 bg-white/[0.03] rounded w-full" />
            </div>
          ))
        ) : items.length === 0 ? (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 text-center text-white/30 py-16">No messages yet</div>
        ) : items.map((msg) => {
          const isOpen = expanded === msg._id;
          return (
            <div key={msg._id} className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 cursor-pointer hover:border-white/[0.10] transition-all" onClick={() => setExpanded(isOpen ? null : msg._id)}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-white font-medium text-sm truncate">{msg.name}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
                    <span className="flex items-center gap-1 text-white/40 text-xs"><Mail className="w-3 h-3" />{msg.email}</span>
                    <span className="flex items-center gap-1 text-white/40 text-xs"><Phone className="w-3 h-3" />{msg.contact}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-white/25 text-xs whitespace-nowrap">{new Date(msg.createdAt).toLocaleDateString("en-IN")}</span>
                  {isFaculty && (
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(msg._id); }} disabled={deleting === msg._id} className="p-1.5 rounded-lg text-white/20 hover:text-red-400 hover:bg-red-500/[0.08] transition-all disabled:opacity-40" title="Delete">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-3 text-white/50 text-sm leading-relaxed">
                {isOpen ? msg.message : msg.message.length > 120 ? msg.message.slice(0, 120) + "…" : msg.message}
              </p>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <p className="text-xs text-white/30">Page {page} of {totalPages}</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/80 disabled:opacity-30 transition-all"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages} className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/40 hover:text-white/80 disabled:opacity-30 transition-all"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}
