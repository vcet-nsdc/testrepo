"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Globe, RefreshCw, ChevronDown, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type CmsType = "team" | "faq" | "sponsor" | "announcement" | "social" | "page" | "gallery";

interface CmsItem {
  _id: string;
  type: CmsType;
  key?: string;
  status: "draft" | "published";
  order: number;
  data: Record<string, unknown>;
  version: number;
  updatedAt: string;
}

const CMS_TYPES: CmsType[] = ["team", "faq", "sponsor", "announcement", "social", "page", "gallery"];

const TYPE_LABELS: Record<CmsType, string> = {
  team: "Team Members",
  faq: "FAQs",
  sponsor: "Sponsors",
  announcement: "Announcements",
  social: "Socials",
  page: "Pages",
  gallery: "Gallery",
};

// Field definitions per type
const TYPE_FIELDS: Record<CmsType, { key: string; label: string; type?: string; required?: boolean }[]> = {
  team: [
    { key: "name", label: "Name", required: true },
    { key: "position", label: "Position", required: true },
    { key: "email", label: "Email", type: "email" },
    { key: "instagram", label: "Instagram URL" },
    { key: "linkedin", label: "LinkedIn URL" },
    { key: "photo", label: "Photo URL" },
  ],
  faq: [
    { key: "q", label: "Question", required: true },
    { key: "a", label: "Answer", required: true, type: "textarea" },
  ],
  sponsor: [
    { key: "name", label: "Name", required: true },
    { key: "logo", label: "Logo URL" },
    { key: "tier", label: "Tier (gold/silver/bronze)" },
    { key: "url", label: "Website URL" },
  ],
  announcement: [
    { key: "title", label: "Title", required: true },
    { key: "body", label: "Body", required: true, type: "textarea" },
    { key: "active", label: "Active", type: "checkbox" },
  ],
  social: [
    { key: "platform", label: "Platform", required: true },
    { key: "url", label: "URL", required: true },
    { key: "icon", label: "Icon name" },
  ],
  page: [
    { key: "title", label: "Title", required: true },
    { key: "body", label: "Body (HTML/Markdown)", required: true, type: "textarea" },
  ],
  gallery: [
    { key: "title", label: "Title" },
    { key: "images", label: "Image URLs (one per line)", type: "textarea" },
  ],
};

const inputCls = "w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 transition-all";

function ItemForm({ type, initial, onSave, onCancel }: {
  type: CmsType;
  initial?: CmsItem;
  onSave: (data: Record<string, unknown>, key?: string, order?: number) => Promise<void>;
  onCancel: () => void;
}) {
  const fields = TYPE_FIELDS[type];
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const init: Record<string, unknown> = {};
    fields.forEach((f) => { init[f.key] = initial?.data?.[f.key] ?? (f.type === "checkbox" ? false : f.key === "images" ? "" : ""); });
    return init;
  });
  const [key, setKey] = useState(initial?.key || "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (k: string, v: unknown) => setValues((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      // Coerce images textarea → array
      const data: Record<string, unknown> = { ...values };
      if (type === "gallery" && typeof data.images === "string") {
        data.images = (data.images as string).split("\n").map((s) => s.trim()).filter(Boolean);
      }
      await onSave(data, key || undefined, order);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-4 bg-[#0d0d16] border border-violet-500/20 rounded-xl space-y-3">
      {error && <div className="text-red-300 text-xs">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-white/40 block mb-1">Key (optional)</label>
          <input className={inputCls} value={key} onChange={(e) => setKey(e.target.value)} placeholder="unique-key" />
        </div>
        <div>
          <label className="text-xs text-white/40 block mb-1">Order</label>
          <input type="number" className={inputCls} value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </div>
      </div>
      {fields.map((f) => (
        <div key={f.key}>
          <label className="text-xs text-white/40 block mb-1">
            {f.label}{f.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
          {f.type === "textarea" ? (
            <textarea
              className={cn(inputCls, f.key === "body" || f.key === "images" ? "font-mono" : "")}
              rows={4}
              value={(values[f.key] as string) || ""}
              onChange={(e) => set(f.key, e.target.value)}
              required={f.required}
            />
          ) : f.type === "checkbox" ? (
            <label className="flex items-center gap-2 text-sm text-white/60 cursor-pointer">
              <input type="checkbox" checked={!!values[f.key]} onChange={(e) => set(f.key, e.target.checked)} />
              Enabled
            </label>
          ) : (
            <input
              type={f.type || "text"}
              className={inputCls}
              value={(values[f.key] as string) || ""}
              onChange={(e) => set(f.key, e.target.value)}
              required={f.required}
            />
          )}
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-300 text-sm transition-all disabled:opacity-50">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {initial ? "Update" : "Create"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white text-sm transition-all">
          Cancel
        </button>
      </div>
    </form>
  );
}

function TypeSection({ type }: { type: CmsType }) {
  const [items, setItems] = useState<CmsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!open) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/cms/${type}`);
      const data = await res.json();
      setItems(data.data || []);
    } finally {
      setLoading(false);
    }
  }, [open, type]);

  useEffect(() => { load(); }, [load]);

  const save = async (data: Record<string, unknown>, key?: string, order?: number, id?: string) => {
    const res = await fetch(`/api/admin/cms/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data, key, order }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || "Failed");
    setCreating(false);
    setEditing(null);
    load();
  };

  const publish = async (id: string) => {
    setPublishing(id);
    await fetch(`/api/admin/cms/${type}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish" }),
    });
    setPublishing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this content item?")) return;
    await fetch(`/api/admin/cms/${type}/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-white font-medium">{TYPE_LABELS[type]}</span>
          {items.length > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-white/[0.06] text-white/40 text-xs">{items.length}</span>
          )}
        </div>
        <ChevronDown className={cn("w-4 h-4 text-white/30 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-white/[0.06] p-4 space-y-3">
          <div className="flex justify-end">
            <button
              onClick={load}
              className="p-1.5 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-all mr-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => { setCreating(true); setEditing(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/20 text-violet-300 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          {creating && (
            <ItemForm
              type={type}
              onSave={(data, key, order) => save(data, key, order)}
              onCancel={() => setCreating(false)}
            />
          )}

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-white/[0.03] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 && !creating ? (
            <p className="text-center py-6 text-white/20 text-sm">No {TYPE_LABELS[type].toLowerCase()} yet</p>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item._id}>
                  {editing === item._id ? (
                    <ItemForm
                      type={type}
                      initial={item}
                      onSave={(data, key, order) => save(data, key, order, item._id)}
                      onCancel={() => setEditing(null)}
                    />
                  ) : (
                    <div className="group flex items-center gap-3 px-3 py-2.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08] rounded-lg transition-all">
                      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", item.status === "published" ? "bg-emerald-400" : "bg-amber-400")} />
                      <div className="flex-1 min-w-0 text-sm">
                        <span className="text-white/70">
                          {item.key ? <span className="font-mono text-xs text-violet-300">{item.key} · </span> : null}
                          {String(
                            Object.values(item.data)[0] ||
                            item.key ||
                            item._id.slice(-6)
                          ).slice(0, 60)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {item.status === "draft" && (
                          <button
                            onClick={() => publish(item._id)}
                            disabled={publishing === item._id}
                            className="p-1.5 rounded text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                            title="Publish"
                          >
                            {publishing === item._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button onClick={() => setEditing(item._id)} className="p-1.5 rounded text-white/30 hover:text-white/80 hover:bg-white/[0.06] transition-all">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => remove(item._id)} className="p-1.5 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function CmsPage() {
  return (
    <div className="space-y-3 max-w-4xl">
      <div className="mb-6">
        <p className="text-white/40 text-sm">Manage all site content. Draft → Publish to make live.</p>
      </div>
      {CMS_TYPES.map((t) => <TypeSection key={t} type={t} />)}
    </div>
  );
}
