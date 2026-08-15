"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

interface SchemaRow {
  _id: string;
  name: string;
  version: number;
  fieldCount: number;
  createdAt: string;
}

export default function FormSchemasPage() {
  const [schemas, setSchemas] = useState<SchemaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/form-schemas");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Failed to load");
      setSchemas(json.data || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete schema "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/form-schemas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setSchemas((prev) => prev.filter((s) => s._id !== id));
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white font-semibold text-lg">Form Schemas</h1>
          <p className="text-white/40 text-sm mt-0.5">Manage dynamic form definitions</p>
        </div>
        <Link
          href="/admin/form-schemas/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/30 text-violet-300 text-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          New Schema
        </Link>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>
      )}

      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {["Name", "Version", "Fields", "Created", "Actions"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-white/40 font-medium text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center">
                  <Loader2 className="w-5 h-5 text-white/20 animate-spin mx-auto" />
                </td>
              </tr>
            ) : schemas.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-white/20 text-sm">
                  No schemas yet.{" "}
                  <Link href="/admin/form-schemas/new" className="text-violet-400 hover:underline">Create one</Link>
                </td>
              </tr>
            ) : (
              schemas.map((s) => (
                <tr key={s._id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="px-5 py-3 text-white font-medium">{s.name}</td>
                  <td className="px-5 py-3 text-white/50">v{s.version}</td>
                  <td className="px-5 py-3 text-white/50">{s.fieldCount}</td>
                  <td className="px-5 py-3 text-white/40 text-xs">{new Date(s.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/form-schemas/${s._id}/edit`}
                        className="p-1.5 rounded text-white/30 hover:text-white/80 hover:bg-white/[0.06] transition-all"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDelete(s._id, s.name)}
                        disabled={deleting === s._id}
                        className="p-1.5 rounded text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-40"
                        title="Delete"
                      >
                        {deleting === s._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
