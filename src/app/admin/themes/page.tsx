"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, RefreshCw, Layers, ToggleLeft, ToggleRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeForm from "./ThemeForm";

interface ThemeSection { type: string; enabled: boolean; order: number }
interface Theme {
  _id: string; name: string; slug: string;
  category: string; description?: string;
  layout: { sections: ThemeSection[] };
  isActive: boolean; createdAt: string;
}

const CATEGORY_CLS: Record<string, string> = {
  hackathon: "bg-violet-500/10 text-violet-300 border-violet-500/20", workshop: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  webinar: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20", bootcamp: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  competition: "bg-rose-500/10 text-rose-300 border-rose-500/20", custom: "bg-white/5 text-white/40 border-white/10",
};

export default function ThemesPage() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Theme | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/themes");
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed");
      setThemes(data.data || []);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to load themes"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setPanelOpen(true); };
  const openEdit = (t: Theme) => { setEditing(t); setPanelOpen(true); };
  const closePanel = () => { setPanelOpen(false); setEditing(null); };
  const onSaved = () => { closePanel(); load(); };

  const toggleActive = async (t: Theme) => {
    setToggling(t._id);
    try {
      const res = await fetch(`/api/admin/themes/${t._id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !t.isActive }),
      });
      if (res.ok) setThemes((prev) => prev.map((x) => x._id === t._id ? { ...x, isActive: !t.isActive } : x));
    } finally { setToggling(null); }
  };

  const deleteTheme = async (t: Theme) => {
    if (!confirm(`Delete theme "${t.name}"? This cannot be undone.`)) return;
    setDeleting(t._id);
    try {
      const res = await fetch(`/api/admin/themes/${t._id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.status === 409) { alert(data?.error?.message || "Theme is in use by events"); return; }
      if (res.ok) setThemes((prev) => prev.filter((x) => x._id !== t._id));
    } finally { setDeleting(null); }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">{themes.length} theme{themes.length !== 1 ? "s" : ""}</p>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-white/40 hover:text-white/80 transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={openNew} className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-300 transition-all">
            <Plus className="w-3.5 h-3.5" /> New Theme
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">{error}</div>}

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 bg-white/[0.03] border border-white/[0.06] rounded-2xl animate-pulse" />)}
        </div>
      ) : themes.length === 0 ? (
        <div className="py-20 text-center">
          <Layers className="w-10 h-10 text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No themes yet</p>
          <button onClick={openNew} className="inline-block mt-4 px-4 py-2 text-sm text-violet-300 bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 rounded-lg transition-all">Create first theme</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {themes.map((t) => {
            const catCls = CATEGORY_CLS[t.category] ?? CATEGORY_CLS.custom;
            const enabledCount = t.layout.sections.filter((s) => s.enabled).length;
            return (
              <div key={t._id} className="group bg-white/[0.02] border border-white/[0.06] hover:border-white/10 rounded-2xl p-5 space-y-3 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-white font-medium truncate">{t.name}</p>
                    <p className="text-white/30 text-xs font-mono mt-0.5 truncate">/{t.slug}</p>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded-md text-xs border flex-shrink-0 capitalize", catCls)}>{t.category}</span>
                </div>
                {t.description && <p className="text-white/40 text-xs line-clamp-2">{t.description}</p>}
                <div className="flex items-center gap-2 text-xs text-white/30">
                  <span>{enabledCount}/{t.layout.sections.length} sections</span>
                  <span className={cn("ml-auto px-1.5 py-0.5 rounded text-[11px] border", t.isActive ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-white/5 text-white/30 border-white/10")}>
                    {t.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-1 pt-1 border-t border-white/[0.04]">
                  <button onClick={() => openEdit(t)} className="p-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all" title="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => toggleActive(t)} disabled={toggling === t._id} className="p-2 rounded-lg text-white/40 hover:text-violet-300 hover:bg-violet-500/10 transition-all disabled:opacity-50" title="Toggle active">
                    {t.isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={() => deleteTheme(t)} disabled={!!deleting} className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50 ml-auto" title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {panelOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closePanel} />
          <div className="relative ml-auto w-full max-w-lg h-full bg-[#0d0d14] border-l border-white/[0.06] overflow-y-auto p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-white font-semibold text-base">{editing ? "Edit Theme" : "New Theme"}</h2>
              <button onClick={closePanel} className="text-white/30 hover:text-white/60 text-lg leading-none">✕</button>
            </div>
            <ThemeForm
              initial={editing ? { _id: editing._id, name: editing.name, slug: editing.slug, category: editing.category, ...(editing.description !== undefined && { description: editing.description }), layout: editing.layout, isActive: editing.isActive } : undefined}
              onSaved={onSaved}
              onCancel={closePanel}
            />
          </div>
        </div>
      )}
    </div>
  );
}
