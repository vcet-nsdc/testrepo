"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const SECTION_TYPES = ["hero", "about", "schedule", "sponsors", "gallery", "faq", "register"] as const;
const CATEGORIES = ["hackathon", "workshop", "webinar", "bootcamp", "competition", "custom"] as const;
const inputCls = "w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all";

type SectionType = typeof SECTION_TYPES[number];
interface SectionState { type: SectionType; enabled: boolean; order: number }

interface ThemeFormProps {
  initial?: {
    _id?: string | undefined; name?: string | undefined; slug?: string | undefined; category?: string | undefined;
    description?: string | undefined; layout?: { sections: { type: string; enabled: boolean; order: number }[] } | undefined; isActive?: boolean | undefined;
  } | undefined;
  onSaved: () => void;
  onCancel: () => void;
}

function slugify(s: string) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }

export default function ThemeForm({ initial, onSaved, onCancel }: ThemeFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState(initial?.category ?? "custom");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [sections, setSections] = useState<SectionState[]>(() =>
    SECTION_TYPES.map((type) => {
      const found = initial?.layout?.sections?.find((s) => s.type === type);
      return found ? { type, enabled: found.enabled, order: found.order } : { type, enabled: true, order: SECTION_TYPES.indexOf(type) };
    })
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initial?._id) setSlug(slugify(name));
  }, [name, initial?._id]);

  const updateSection = (type: SectionType, key: "enabled" | "order", val: boolean | number) => {
    setSections((prev) => prev.map((s) => s.type === type ? { ...s, [key]: val } : s));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError("");
    const payload = { name, slug, category, description, layout: { sections }, isActive };
    try {
      const url = initial?._id ? `/api/admin/themes/${initial._id}` : "/api/admin/themes";
      const method = initial?._id ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to save");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Name</label>
          <input className={inputCls} placeholder="Theme name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Slug</label>
          <input className={inputCls} placeholder="theme-slug" value={slug} onChange={(e) => setSlug(e.target.value)} pattern="^[a-z0-9-]+$" required />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Category</label>
        <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>
      <div className="space-y-1.5">
        <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Description</label>
        <textarea className={cn(inputCls, "resize-none h-20")} placeholder="Optional description…" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>
      <div className="space-y-2">
        <label className="text-xs text-white/50 font-medium uppercase tracking-wider">Sections</label>
        <div className="space-y-1.5">
          {sections.map((sec) => (
            <div key={sec.type} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-lg px-3 py-2">
              <input type="checkbox" checked={sec.enabled} onChange={(e) => updateSection(sec.type, "enabled", e.target.checked)} className="accent-violet-500" />
              <span className="text-sm text-white/70 flex-1 capitalize">{sec.type}</span>
              <input type="number" min={0} value={sec.order} onChange={(e) => updateSection(sec.type, "order", Number(e.target.value))}
                className="w-16 bg-white/[0.03] border border-white/[0.08] rounded px-2 py-1 text-xs text-white/70 outline-none focus:border-violet-500/50" />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => setIsActive((v) => !v)}
          className={cn("relative w-10 h-5 rounded-full transition-colors", isActive ? "bg-violet-500" : "bg-white/10")}>
          <span className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all", isActive ? "left-5.5 left-[22px]" : "left-0.5")} />
        </button>
        <span className="text-sm text-white/60">{isActive ? "Active" : "Inactive"}</span>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.06]">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-white/50 hover:text-white/80 transition-colors">Cancel</button>
        <button type="submit" disabled={saving}
          className="px-4 py-2 text-sm rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-300 transition-all disabled:opacity-50">
          {saving ? "Saving…" : initial?._id ? "Save Changes" : "Create Theme"}
        </button>
      </div>
    </form>
  );
}
