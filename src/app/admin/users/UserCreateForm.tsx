"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Roles } from "@/config/roles";

const inputCls =
  "w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}

export default function UserCreateForm({ onClose, onCreated }: Props) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: Roles.DEVELOPER_ADMIN });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setErr(data?.error?.message || "Failed to create user"); return; }
      onCreated();
      onClose();
    } catch {
      setErr("Network error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div
        className="h-full w-full max-w-sm bg-[#0a0a0f] border-l border-white/[0.06] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-white font-semibold">New User</h2>
          <button onClick={onClose} className="p-1 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.06] transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={submit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {err && <p className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">{err}</p>}

          <div className="space-y-1">
            <label className="text-xs text-white/40">Full Name</label>
            <input className={inputCls} placeholder="Jane Doe" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/40">Email</label>
            <input className={inputCls} type="email" placeholder="jane@vcet.edu.in" value={form.email} onChange={(e) => set("email", e.target.value)} required />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/40">Password (min 8 chars)</label>
            <input className={inputCls} type="password" placeholder="••••••••" value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={8} />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/40">Role</label>
            <select
              className={cn(inputCls, "cursor-pointer")}
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
            >
              <option value={Roles.DEVELOPER_ADMIN}>Developer Admin</option>
              <option value={Roles.FACULTY_ADMIN}>Faculty Admin</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all disabled:opacity-50"
          >
            {busy ? "Creating…" : "Create User"}
          </button>
        </form>
      </div>
    </div>
  );
}
