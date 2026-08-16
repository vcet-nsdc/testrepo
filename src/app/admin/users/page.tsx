"use client";

import { useState, useEffect, useCallback } from "react";
import { UserCog, Plus, RefreshCw } from "lucide-react";
import { useSession } from "next-auth/react";
import UserRow, { type AdminUser } from "./UserRow";
import UserCreateForm from "./UserCreateForm";

const COLS = ["Name", "Email", "Role", "Status", "Last Login", "Created", "Actions"];

export default function UsersPage() {
  const { data: session } = useSession();
  const selfId = (session?.user as { id?: string })?.id ?? "";

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [busyId, setBusyId] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/users?limit=100");
      if (res.status === 401) { window.location.href = "/admin/login"; return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed");
      setUsers(data.data ?? []);
      setTotal(data.pagination?.total ?? 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const patch = async (id: string, update: { isActive?: boolean; role?: string }) => {
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(update),
      });
      if (res.ok) await load();
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
            <UserCog className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h1 className="text-white font-semibold">Admin Users</h1>
            <p className="text-white/30 text-xs">{total} user{total !== 1 ? "s" : ""}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="p-2 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] text-white/40 hover:text-white/80 transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-all"
          >
            <Plus className="w-4 h-4" />
            New User
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">{error}</div>}

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {COLS.map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-white/30 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.04]">
                    {COLS.map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-white/[0.04] rounded animate-pulse" style={{ width: `${55 + (j * 17) % 40}%` }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} className="px-4 py-16 text-center text-white/30">No users found</td>
                </tr>
              ) : (
                users.map((u) => (
                  <UserRow key={u._id} user={u} selfId={selfId} onPatch={patch} busy={busyId} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <UserCreateForm onClose={() => setShowCreate(false)} onCreated={load} />
      )}
    </div>
  );
}
