"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronUp, ChevronDown, Loader2, ChevronRight, CreditCard, Image as ImageIcon, Edit2, Check } from "lucide-react";
import type { IFormField, FieldType } from "@/models/FormSchema";

const ic = "w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all";
const TYPES: FieldType[] = ["text", "email", "phone", "select", "number", "file", "checkbox", "textarea"];

interface BF extends Omit<IFormField, "key"> {
  key: string;
}

const blank = (): BF => ({ key: "", label: "", type: "text", required: false });

export default function SchemaEditor({ id, initialName = "", initialFields = [] }: { id?: string; initialName?: string; initialFields?: IFormField[] }) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [fields, setFields] = useState<BF[]>(initialFields);
  const [adding, setAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<BF>(blank());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const toKey = (l: string) => l.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
  const sd = <K extends keyof BF>(k: K, v: BF[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const move = (i: number, d: -1 | 1) =>
    setFields((fs) => {
      const a = [...fs];
      const t = a[i] as BF;
      a[i] = a[i + d] as BF;
      a[i + d] = t;
      return a;
    });

  const startAdd = () => {
    setEditingIndex(null);
    setDraft(blank());
    setAdding(true);
  };

  const startEdit = (i: number) => {
    setEditingIndex(i);
    setDraft({ ...fields[i]! });
    setAdding(true);
  };

  const saveField = () => {
    if (!draft.label) return;
    const key = draft.key || toKey(draft.label);
    const fieldData: BF = { ...draft, key };

    if (editingIndex !== null) {
      setFields((fs) => fs.map((f, idx) => (idx === editingIndex ? fieldData : f)));
    } else {
      setFields((fs) => [...fs, fieldData]);
    }

    setDraft(blank());
    setAdding(false);
    setEditingIndex(null);
  };

  // Quick Preset: Add Payment Fields (Transaction ID & Payment Screenshot Image)
  const addPaymentFields = () => {
    const newFields: BF[] = [];
    if (!fields.some((f) => f.key === "transaction_id" || f.key === "transactionId")) {
      newFields.push({
        key: "transaction_id",
        label: "Transaction ID",
        type: "text",
        required: true,
      });
    }
    if (!fields.some((f) => f.key === "payment_screenshot" || f.key === "paymentScreenshot")) {
      newFields.push({
        key: "payment_screenshot",
        label: "Payment Screenshot Image",
        type: "file",
        required: true,
      });
    }

    if (newFields.length > 0) {
      setFields((fs) => [...fs, ...newFields]);
    }
  };

  const addTxIdField = () => {
    if (!fields.some((f) => f.key === "transaction_id" || f.key === "transactionId")) {
      setFields((fs) => [
        ...fs,
        {
          key: "transaction_id",
          label: "Transaction ID",
          type: "text",
          required: true,
        },
      ]);
    }
  };

  const addPaymentScreenshotField = () => {
    if (!fields.some((f) => f.key === "payment_screenshot" || f.key === "paymentScreenshot")) {
      setFields((fs) => [
        ...fs,
        {
          key: "payment_screenshot",
          label: "Payment Screenshot Image",
          type: "file",
          required: true,
        },
      ]);
    }
  };

  const save = async () => {
    if (!name.trim()) {
      setError("Schema name is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(id ? `/api/admin/form-schemas/${id}` : "/api/admin/form-schemas", {
        method: id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), fields }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Save failed");
      router.push("/admin/form-schemas");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const isTxField = (key: string) => key === "transaction_id" || key === "transactionId" || key.includes("transaction");
  const isScreenshotField = (key: string) => key === "payment_screenshot" || key === "paymentScreenshot" || key.includes("screenshot");

  return (
    <div className="space-y-6 max-w-3xl">
      {error && <div className="px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>}

      {/* Schema Name */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5">
        <label className="text-xs text-white/40 block mb-2">Schema Name *</label>
        <input className={ic} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Event Registration Form with Payment" />
      </div>

      {/* Payment Quick Actions */}
      <div className="bg-gradient-to-r from-violet-950/30 via-purple-900/20 to-black border border-violet-500/20 rounded-2xl p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Payment Fields Quick Add</h3>
          </div>
          <span className="text-xs text-white/40 font-mono">Transaction ID & Screenshot</span>
        </div>
        <p className="text-xs text-white/60">Easily attach payment collection fields to your custom form schema:</p>
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={addPaymentFields}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-violet-500/20 hover:bg-violet-500/30 border border-violet-500/40 text-violet-200 transition-all shadow-sm"
          >
            <CreditCard className="w-3.5 h-3.5 text-violet-400" />
            + Add Full Payment Block (TxID + Screenshot)
          </button>
          <button
            type="button"
            onClick={addTxIdField}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/80 transition-all"
          >
            + Transaction ID
          </button>
          <button
            type="button"
            onClick={addPaymentScreenshotField}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-white/80 transition-all"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            + Payment Screenshot Image
          </button>
        </div>
      </div>

      {/* Fields List */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-white font-medium text-sm">Form Fields ({fields.length})</span>
          <button
            onClick={startAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/20 text-violet-300 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Field
          </button>
        </div>

        {fields.map((f, i) => (
          <div key={i} className="group flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.05] hover:border-white/10 rounded-xl transition-all">
            <div className="flex flex-col">
              <button onClick={() => i > 0 && move(i, -1)} disabled={i === 0} className="text-white/20 hover:text-white/60 disabled:invisible">
                <ChevronUp className="w-3 h-3" />
              </button>
              <button onClick={() => i < fields.length - 1 && move(i, 1)} disabled={i === fields.length - 1} className="text-white/20 hover:text-white/60 disabled:invisible">
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 min-w-0 text-sm flex items-center flex-wrap gap-2">
              <span className="text-white/90 font-medium">{f.label}</span>
              <span className="text-white/30 text-xs font-mono">({f.key})</span>

              {/* Badges */}
              <span className="px-2 py-0.5 rounded text-[10px] bg-white/[0.06] text-white/50 uppercase font-mono">{f.type}</span>
              {f.required && <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-300 border border-red-500/20 font-medium">required</span>}

              {isTxField(f.key) && (
                <span className="px-2 py-0.5 rounded text-[10px] bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1 font-medium">
                  <CreditCard className="w-3 h-3" /> Payment TxID
                </span>
              )}
              {isScreenshotField(f.key) && (
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
                  <ImageIcon className="w-3 h-3" /> Screenshot Image
                </span>
              )}

              {f.type === "select" && f.options?.length ? <span className="text-white/25 text-xs">[{f.options.join(", ")}]</span> : null}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => startEdit(i)}
                className="p-1.5 rounded text-white/40 hover:text-violet-300 hover:bg-violet-500/10 transition-all"
                title="Edit Field"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setFields((fs) => fs.filter((_, x) => x !== i))}
                className="p-1.5 rounded text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Delete Field"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {fields.length === 0 && !adding && <p className="text-center py-6 text-white/20 text-sm">No fields added yet. Click above or use the quick payment buttons.</p>}

        {/* Add/Edit Field Box */}
        {adding && (
          <div className="border border-violet-500/30 rounded-xl p-4 space-y-3 bg-[#0d0d16] shadow-xl">
            <div className="flex items-center justify-between pb-1 border-b border-white/5">
              <span className="text-xs font-semibold text-violet-300 uppercase tracking-wider">
                {editingIndex !== null ? `Edit Field #${editingIndex + 1}` : "New Form Field"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 block mb-1">Field Label *</label>
                <input
                  className={ic}
                  value={draft.label}
                  placeholder="e.g. Payment Screenshot Image or Transaction ID"
                  onChange={(e) => {
                    sd("label", e.target.value);
                    if (!draft.key || editingIndex === null) sd("key", toKey(e.target.value));
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Field Key (System identifier)</label>
                <input className={ic} value={draft.key} placeholder="payment_screenshot" onChange={(e) => sd("key", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/40 block mb-1">Field Type</label>
                <select className={ic} value={draft.type} onChange={(e) => sd("type", e.target.value as FieldType)}>
                  {TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t === "file" ? "file (Image / File Upload)" : t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end pb-2">
                <label className="flex items-center gap-2 text-sm text-white/70 cursor-pointer">
                  <input type="checkbox" checked={draft.required} onChange={(e) => sd("required", e.target.checked)} className="rounded accent-violet-500" />
                  Required Field
                </label>
              </div>
            </div>

            {draft.type === "select" && (
              <div>
                <label className="text-xs text-white/40 block mb-1">Options (one per line)</label>
                <textarea
                  className={ic}
                  rows={3}
                  value={draft.options?.join("\n") ?? ""}
                  onChange={(e) => sd("options", e.target.value.split("\n"))}
                />
              </div>
            )}

            <details>
              <summary className="flex items-center gap-1 text-xs text-white/30 cursor-pointer hover:text-white/50 list-none select-none">
                <ChevronRight className="w-3 h-3" /> Advanced (Conditional Display)
              </summary>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                <div>
                  <label className="text-xs text-white/40 block mb-1">Show when field</label>
                  <input
                    className={ic}
                    value={draft.conditional?.fieldKey ?? ""}
                    placeholder="field_key"
                    onChange={(e) => sd("conditional", { fieldKey: e.target.value, equals: draft.conditional?.equals ?? "" })}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-1">equals</label>
                  <input
                    className={ic}
                    value={draft.conditional?.equals ?? ""}
                    placeholder="value"
                    onChange={(e) => sd("conditional", { fieldKey: draft.conditional?.fieldKey ?? "", equals: e.target.value })}
                  />
                </div>
              </div>
            </details>

            <div className="flex gap-2 pt-2">
              <button onClick={saveField} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-500/25 hover:bg-violet-500/35 border border-violet-500/40 text-violet-200 text-sm font-medium transition-all">
                <Check className="w-4 h-4" />
                {editingIndex !== null ? "Update Field" : "Add Field"}
              </button>
              <button
                onClick={() => {
                  setAdding(false);
                  setEditingIndex(null);
                }}
                className="px-4 py-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-white/50 text-sm transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 border border-violet-400/30 text-white text-sm font-medium transition-all disabled:opacity-50 shadow-lg shadow-violet-950/30"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {id ? "Save Schema Changes" : "Create Form Schema"}
        </button>
        <button onClick={() => router.push("/admin/form-schemas")} className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 text-sm transition-all">
          Cancel
        </button>
      </div>
    </div>
  );
}
