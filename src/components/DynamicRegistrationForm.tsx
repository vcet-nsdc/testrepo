"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import DynamicRegistrationFormPayment from "@/components/DynamicRegistrationFormPayment";

export interface FormField {
  key: string;
  label: string;
  type: "text" | "email" | "phone" | "select" | "number" | "file" | "checkbox" | "textarea";
  required: boolean;
  options?: string[];
  conditional?: { fieldKey: string; equals: string };
}

export interface DynamicFormSchema { id: string; name: string; fields: FormField[] }
export interface DynamicEvent {
  id: string;
  title: string;
  registration?: { fee?: number; requiresPayment?: boolean; teamConfig?: { min?: number; max?: number } | null; formSchemaId?: string | null };
}

const BASE = "w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all";

function DynField({ field, values, onChange }: { field: FormField; values: Record<string, string>; onChange: (k: string, v: string) => void }) {
  if (field.conditional && values[field.conditional.fieldKey] !== field.conditional.equals) return null;
  const common = { name: field.key, required: field.required, className: BASE };
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-white/90 block">{field.label}{field.required ? " *" : ""}</label>
      {field.type === "textarea" ? (
        <textarea {...common} rows={3} onChange={e => onChange(field.key, e.target.value)} />
      ) : field.type === "select" ? (
        <select {...common} className={BASE + " appearance-none cursor-pointer [&>option]:bg-zinc-900"} onChange={e => onChange(field.key, e.target.value)}>
          <option value="">-- Select --</option>
          {field.options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : field.type === "checkbox" ? (
        <input type="checkbox" name={field.key} required={field.required} className="h-4 w-4 accent-purple-500" onChange={e => onChange(field.key, e.target.checked ? "true" : "")} />
      ) : field.type === "file" ? (
        <input type="file" name={field.key} required={field.required} className="w-full bg-black/30 border border-white/10 rounded-lg p-2.5 text-white outline-none focus:ring-2 focus:ring-purple-500/50 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer" />
      ) : (
        <input type={field.type === "phone" ? "tel" : field.type} {...common} onChange={e => onChange(field.key, e.target.value)} />
      )}
    </div>
  );
}

interface Props { event: DynamicEvent; formSchema: DynamicFormSchema; upiId: string | null }

export default function DynamicRegistrationForm({ event, formSchema, upiId }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const onChange = (k: string, v: string) => setValues(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    fd.set("eventId", event.id);
    try {
      const res = await fetch("/api/register", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="flex justify-center mb-6"><div className="h-24 w-24 bg-green-500/20 rounded-full flex items-center justify-center"><CheckCircle2 className="h-12 w-12 text-green-400" /></div></div>
        <h2 className="font-heading text-3xl sm:text-5xl font-bold mb-4 text-white">Registration <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">Successful!</span></h2>
        <p className="text-white/80 text-lg mb-4 font-sans">Your registration has been recorded. Check your email for details.</p>
        <button onClick={() => (window.location.href = "/")} className="bg-white/10 text-white font-semibold text-lg px-8 py-3 rounded-lg border border-white/20 hover:bg-white/20 transition-all">Return to Home</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-4 sm:p-6 md:p-10 relative">
      <div className="mb-6 sm:mb-10 text-center pb-6 sm:pb-8 border-b border-white/10">
        <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-bold mb-3 text-white leading-tight">Register for <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">{event.title}</span></h2>
        {event.registration?.teamConfig && <p className="text-white/70 font-sans text-xs sm:text-sm">Teams of {event.registration.teamConfig.min}–{event.registration.teamConfig.max} members.</p>}
      </div>

      {error && (
        <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-200">
          <AlertCircle className="h-6 w-6 text-red-400 flex-shrink-0" />
          <p className="font-sans">{error}</p>
        </div>
      )}

      <div className="space-y-8 font-sans">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 sm:p-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
            {formSchema.fields.map(field => <DynField key={field.key} field={field} values={values} onChange={onChange} />)}
          </div>
        </div>

        {event.registration?.requiresPayment && (
          <DynamicRegistrationFormPayment fee={event.registration.fee ?? 0} upiId={upiId} />
        )}
      </div>

      <div className="mt-10 pt-8 border-t border-white/10 text-center">
        <button disabled={submitting} type="submit" className="relative inline-flex items-center justify-center w-full sm:w-auto px-10 py-4 font-bold text-white bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl hover:from-purple-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-purple-500 disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:-translate-y-1 transition-all">
          {submitting ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" />PROCESSING...</> : "SUBMIT REGISTRATION"}
        </button>
      </div>
    </form>
  );
}
