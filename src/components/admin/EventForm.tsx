"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save, Loader2, Plus, X, FileEdit } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventFormProps {
  initial?: Partial<EventFormData>;
  eventId?: string;
}

interface EventFormData {
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  startsAt: string;
  endsAt: string;
  venue: string;
  summary: string;
  content: string;
  coverImage: string;
  registrationEnabled: boolean;
  registrationFee: number;
  requiresPayment: boolean;
  requiresApproval: boolean;
  teamMin: number;
  teamMax: number;
  formSchemaId?: string;
  highlights: string[];
  faqs: { q: string; a: string }[];
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition-all";

export default function EventForm({ initial, eventId }: EventFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState<EventFormData>({
    title: initial?.title || "",
    slug: initial?.slug || "",
    status: initial?.status || "draft",
    startsAt: initial?.startsAt || "",
    endsAt: initial?.endsAt || "",
    venue: initial?.venue || "",
    summary: initial?.summary || "",
    content: initial?.content || "",
    coverImage: initial?.coverImage || "",
    registrationEnabled: initial?.registrationEnabled ?? false,
    registrationFee: initial?.registrationFee || 0,
    requiresPayment: initial?.requiresPayment ?? false,
    requiresApproval: initial?.requiresApproval ?? true,
    teamMin: initial?.teamMin || 1,
    teamMax: initial?.teamMax || 4,
    formSchemaId: initial?.formSchemaId || "",
    highlights: initial?.highlights || [],
    faqs: initial?.faqs || [],
  });

  const [schemas, setSchemas] = useState<{ _id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/admin/form-schemas")
      .then((r) => r.json())
      .then((d) => setSchemas(d.data || []))
      .catch(() => {});
  }, []);

  const [newHighlight, setNewHighlight] = useState("");
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");

  const set = (key: keyof EventFormData, val: unknown) =>
    setForm((f) => ({ ...f, [key]: val }));

  const autoSlug = (title: string) => {
    if (!form.slug || form.slug === autoSlugFrom(form.title)) {
      set("slug", autoSlugFrom(title));
    }
    set("title", title);
  };

  const autoSlugFrom = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 80);

  const addHighlight = () => {
    if (newHighlight.trim()) {
      set("highlights", [...form.highlights, newHighlight.trim()]);
      setNewHighlight("");
    }
  };

  const addFaq = () => {
    if (newFaqQ.trim() && newFaqA.trim()) {
      set("faqs", [...form.faqs, { q: newFaqQ.trim(), a: newFaqA.trim() }]);
      setNewFaqQ("");
      setNewFaqA("");
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    const body = {
      title: form.title,
      slug: form.slug,
      status: form.status,
      startsAt: form.startsAt || undefined,
      endsAt: form.endsAt || undefined,
      venue: form.venue || undefined,
      summary: form.summary || undefined,
      content: form.content || undefined,
      coverImage: form.coverImage || undefined,
      registration: {
        enabled: form.registrationEnabled,
        fee: form.registrationFee,
        requiresPayment: form.requiresPayment,
        requiresApproval: form.requiresApproval,
        teamConfig: { min: form.teamMin, max: form.teamMax },
        formSchemaId: form.formSchemaId || undefined,
      },
      highlights: form.highlights,
      faqs: form.faqs,
    };

    try {
      const url = eventId ? `/api/admin/events/${eventId}` : "/api/admin/events";
      const method = eventId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error?.message || "Failed to save");
      setSuccess("Saved!");
      setTimeout(() => router.push("/admin/events"), 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 max-w-3xl">
      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">{error}</div>}
      {success && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm">{success}</div>}

      {/* Core */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white/70">Basic Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title" required>
            <input className={inputCls} value={form.title} onChange={(e) => autoSlug(e.target.value)} placeholder="TechBlitz 2025" required />
          </Field>
          <Field label="Slug" required>
            <input className={cn(inputCls, "font-mono")} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="techblitz-2025" required />
          </Field>
        </div>
        <Field label="Status">
          <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value as "draft")}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </Field>
        <Field label="Summary">
          <textarea className={inputCls} rows={2} value={form.summary} onChange={(e) => set("summary", e.target.value)} placeholder="Short description shown in listings" />
        </Field>
        <Field label="Content (Markdown/HTML)">
          <textarea className={cn(inputCls, "font-mono")} rows={6} value={form.content} onChange={(e) => set("content", e.target.value)} placeholder="Full event description…" />
        </Field>
      </div>

      {/* Dates & Location */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 sm:p-5 space-y-4">
        <h3 className="text-sm font-semibold text-white/70">Schedule & Location</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Starts At">
            <input type="datetime-local" className={inputCls} value={form.startsAt} onChange={(e) => set("startsAt", e.target.value)} />
          </Field>
          <Field label="Ends At">
            <input type="datetime-local" className={inputCls} value={form.endsAt} onChange={(e) => set("endsAt", e.target.value)} />
          </Field>
        </div>
        <Field label="Venue">
          <input className={inputCls} value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="VCET Auditorium" />
        </Field>
        <Field label="Cover Image URL">
          <input className={inputCls} value={form.coverImage} onChange={(e) => set("coverImage", e.target.value)} placeholder="https://…" />
        </Field>
      </div>

      {/* Registration */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 sm:p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white/70">Registration</h3>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-white/40">Enable</span>
            <button
              type="button"
              onClick={() => set("registrationEnabled", !form.registrationEnabled)}
              className={cn(
                "w-9 h-5 rounded-full transition-colors relative",
                form.registrationEnabled ? "bg-violet-500" : "bg-white/10"
              )}
            >
              <span className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all", form.registrationEnabled ? "left-4" : "left-0.5")} />
            </button>
          </label>
        </div>
        {form.registrationEnabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Team Min">
                <input type="number" min={1} className={inputCls} value={form.teamMin} onChange={(e) => set("teamMin", Number(e.target.value))} />
              </Field>
              <Field label="Team Max">
                <input type="number" min={1} className={inputCls} value={form.teamMax} onChange={(e) => set("teamMax", Number(e.target.value))} />
              </Field>
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-white/60">
                <input type="checkbox" checked={form.requiresPayment} onChange={(e) => set("requiresPayment", e.target.checked)} className="rounded" />
                Requires Payment
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-white/60">
                <input type="checkbox" checked={form.requiresApproval} onChange={(e) => set("requiresApproval", e.target.checked)} className="rounded" />
                Requires Approval
              </label>
            </div>
            {form.requiresPayment && (
              <Field label="Fee (₹)">
                <input type="number" min={0} className={inputCls} value={form.registrationFee} onChange={(e) => set("registrationFee", Number(e.target.value))} />
              </Field>
            )}

            <Field label="Registration Form Schema (Google Forms Style)">
              <div className="flex gap-2">
                <select
                  className={cn(inputCls, "flex-1 cursor-pointer [&>option]:bg-zinc-900")}
                  value={form.formSchemaId || ""}
                  onChange={(e) => set("formSchemaId", e.target.value)}
                >
                  <option value="">-- Standard Registration Form --</option>
                  {schemas.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {form.formSchemaId ? (
                  <Link
                    href={`/admin/form-schemas/${form.formSchemaId}/edit`}
                    target="_blank"
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-violet-500/20 border border-violet-500/30 text-violet-300 hover:bg-violet-500/30 transition-all whitespace-nowrap"
                  >
                    <FileEdit className="w-3.5 h-3.5" />
                    Edit Form
                  </Link>
                ) : (
                  <Link
                    href="/admin/form-schemas/new"
                    target="_blank"
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg bg-white/[0.06] border border-white/10 text-white/70 hover:text-white transition-all whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New Form
                  </Link>
                )}
              </div>
            </Field>
          </div>
        )}
      </div>

      {/* Highlights */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white/70">Highlights</h3>
        <div className="flex gap-2">
          <input
            className={cn(inputCls, "flex-1")}
            value={newHighlight}
            onChange={(e) => setNewHighlight(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addHighlight())}
            placeholder="Add a highlight…"
          />
          <button type="button" onClick={addHighlight} className="px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/10 text-white/60 hover:text-white text-sm transition-all">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {form.highlights.length > 0 && (
          <div className="space-y-1.5">
            {form.highlights.map((h, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2 bg-white/[0.03] rounded-lg text-sm text-white/70">
                <span>{h}</span>
                <button type="button" onClick={() => set("highlights", form.highlights.filter((_, j) => j !== i))} className="text-white/20 hover:text-red-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FAQs */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-5 space-y-3">
        <h3 className="text-sm font-semibold text-white/70">FAQs</h3>
        <div className="space-y-2">
          <input className={inputCls} value={newFaqQ} onChange={(e) => setNewFaqQ(e.target.value)} placeholder="Question…" />
          <div className="flex gap-2">
            <input className={cn(inputCls, "flex-1")} value={newFaqA} onChange={(e) => setNewFaqA(e.target.value)} placeholder="Answer…" />
            <button type="button" onClick={addFaq} className="px-3 py-2 rounded-lg bg-white/[0.06] hover:bg-white/10 text-white/60 hover:text-white transition-all">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        {form.faqs.length > 0 && (
          <div className="space-y-2">
            {form.faqs.map((f, i) => (
              <div key={i} className="px-3 py-2.5 bg-white/[0.03] rounded-lg">
                <div className="flex items-start justify-between">
                  <p className="text-sm text-white/80 font-medium">{f.q}</p>
                  <button type="button" onClick={() => set("faqs", form.faqs.filter((_, j) => j !== i))} className="text-white/20 hover:text-red-400 transition-colors ml-2 mt-0.5">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-xs text-white/40 mt-1">{f.a}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : eventId ? "Update Event" : "Create Event"}
        </button>
        <button type="button" onClick={() => router.push("/admin/events")} className="px-5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/60 hover:text-white text-sm transition-all">
          Cancel
        </button>
      </div>
    </form>
  );
}
