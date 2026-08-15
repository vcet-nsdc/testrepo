"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Globe, RefreshCw, Loader2, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
  _id: string;
  key?: string;
  status: "draft" | "published";
  order: number;
  data: {
    name: string;
    position: string;
    email?: string;
    instagram?: string;
    linkedin?: string;
    photo?: string;
  };
}

const inputCls = "w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 transition-all";

function MemberForm({ initial, onSave, onCancel }: {
  initial?: TeamMember;
  onSave: (data: Record<string, unknown>, order?: number) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.data.name || "");
  const [position, setPosition] = useState(initial?.data.position || "");
  const [email, setEmail] = useState(initial?.data.email || "");
  const [instagram, setInstagram] = useState(initial?.data.instagram || "");
  const [linkedin, setLinkedin] = useState(initial?.data.linkedin || "");
  const [photo, setPhoto] = useState(initial?.data.photo || "");
  const [order, setOrder] = useState(initial?.order ?? 0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSave({ name, position, email: email || undefined, instagram: instagram || undefined, linkedin: linkedin || undefined, photo: photo || undefined }, order);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="p-5 bg-[#0d0d16] border border-violet-500/20 rounded-xl space-y-4">
      {error && <div className="text-red-300 text-xs">{error}</div>}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-white/40 block mb-1">Name <span className="text-red-400">*</span></label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Bhavesh Sharma" required />
        </div>
        <div>
          <label className="text-xs text-white/40 block mb-1">Position <span className="text-red-400">*</span></label>
          <input className={inputCls} value={position} onChange={(e) => setPosition(e.target.value)} placeholder="Web Developer" required />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-white/40 block mb-1">Email</label>
          <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="text-xs text-white/40 block mb-1">Order</label>
          <input type="number" className={inputCls} value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-white/40 block mb-1">Instagram URL</label>
          <input className={inputCls} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/…" />
        </div>
        <div>
          <label className="text-xs text-white/40 block mb-1">LinkedIn URL</label>
          <input className={inputCls} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/…" />
        </div>
      </div>
      <div>
        <label className="text-xs text-white/40 block mb-1">Photo URL</label>
        <input className={inputCls} value={photo} onChange={(e) => setPhoto(e.target.value)} placeholder="https://…" />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-300 text-sm transition-all disabled:opacity-50">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {initial ? "Update" : "Add Member"}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 hover:text-white text-sm transition-all">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [publishing, setPublishing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cms/team");
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      const data = await res.json();
      setMembers(data.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (data: Record<string, unknown>, order?: number, id?: string) => {
    const res = await fetch("/api/admin/cms/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, data, order }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json?.error?.message || "Failed");
    setCreating(false);
    setEditing(null);
    load();
  };

  const publish = async (id: string) => {
    setPublishing(id);
    await fetch(`/api/admin/cms/team/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "publish" }),
    });
    setPublishing(null);
    load();
  };

  const remove = async (id: string, name: string) => {
    if (!confirm(`Remove "${name}" from team?`)) return;
    await fetch(`/api/admin/cms/team/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center justify-between">
        <p className="text-white/40 text-sm">{members.length} members · managed via CMS</p>
        <div className="flex gap-2">
          <button onClick={load} className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-white/40 hover:text-white/80 transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => { setCreating(true); setEditing(null); }}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-300 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Member
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">{error}</div>}

      {creating && (
        <MemberForm onSave={(data, order) => save(data, order)} onCancel={() => setCreating(false)} />
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-white/[0.03] border border-white/[0.06] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 && !creating ? (
        <div className="py-16 text-center">
          <p className="text-white/20 text-sm">No team members yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {members.map((m) => (
            <div key={m._id}>
              {editing === m._id ? (
                <MemberForm
                  initial={m}
                  onSave={(data, order) => save(data, order, m._id)}
                  onCancel={() => setEditing(null)}
                />
              ) : (
                <div className="group flex items-center gap-3 p-4 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/10 rounded-xl transition-all">
                  {m.data.photo ? (
                    <img src={m.data.photo} alt={m.data.name} className="w-10 h-10 rounded-full object-cover bg-white/10 flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0 text-violet-300 text-sm font-semibold">
                      {m.data.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-white text-sm font-medium truncate">{m.data.name}</p>
                      <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", m.status === "published" ? "bg-emerald-400" : "bg-amber-400")} />
                    </div>
                    <p className="text-white/40 text-xs truncate">{m.data.position}</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {m.status === "draft" && (
                      <button
                        onClick={() => publish(m._id)}
                        disabled={publishing === m._id}
                        title="Publish"
                        className="p-1.5 rounded text-white/30 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                      >
                        {publishing === m._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    <button onClick={() => setEditing(m._id)} className="p-1.5 rounded text-white/30 hover:text-white/80 hover:bg-white/[0.06] transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => remove(m._id, m.data.name)} className="p-1.5 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all">
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
  );
}
