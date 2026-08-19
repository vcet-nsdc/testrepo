"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, AlertCircle, Sparkles, User } from "lucide-react";
import DynamicRegistrationFormPayment from "@/components/DynamicRegistrationFormPayment";

export interface FormField {
  key: string;
  label: string;
  type: "text" | "email" | "phone" | "select" | "number" | "file" | "checkbox" | "textarea";
  required: boolean;
  options?: string[];
  conditional?: { fieldKey: string; equals: string };
}

export interface DynamicFormSchema {
  id: string;
  name: string;
  fields: FormField[];
}

export interface DynamicEvent {
  id: string;
  title: string;
  registration?: {
    fee?: number;
    requiresPayment?: boolean;
    teamConfig?: { min?: number; max?: number } | null;
    formSchemaId?: string | null;
  };
}

const INPUT_BASE =
  "w-full bg-black/60 border border-white/15 text-white placeholder-white/25 rounded-xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm outline-none focus:border-purple-500/70 focus:ring-2 focus:ring-purple-500/20 transition-all font-sans";

function DynField({
  field,
  values,
  onChange,
}: {
  field: FormField;
  values: Record<string, string>;
  onChange: (k: string, v: string) => void;
}) {
  if (field.conditional && values[field.conditional.fieldKey] !== field.conditional.equals) return null;

  const isFullWidth = field.type === "textarea" || field.type === "file";

  return (
    <div className={`space-y-1.5 sm:space-y-2 font-sans ${isFullWidth ? "md:col-span-2" : ""}`}>
      <label className="text-[11px] sm:text-xs font-semibold text-white/90 uppercase tracking-wider block">
        {field.label}
        {field.required && <span className="text-red-400 ml-1 font-bold">*</span>}
      </label>

      {field.type === "textarea" ? (
        <textarea
          name={field.key}
          required={field.required}
          rows={3}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          className={INPUT_BASE}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      ) : field.type === "select" ? (
        <select
          name={field.key}
          required={field.required}
          className={`${INPUT_BASE} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat pr-10 [&>option]:bg-zinc-900`}
          onChange={(e) => onChange(field.key, e.target.value)}
        >
          <option value="">-- Select {field.label} --</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : field.type === "checkbox" ? (
        <label className="flex items-center gap-3 p-3 bg-black/40 border border-white/10 rounded-xl cursor-pointer hover:border-purple-500/40 transition-colors">
          <input
            type="checkbox"
            name={field.key}
            required={field.required}
            className="w-4 h-4 rounded accent-purple-600 cursor-pointer"
            onChange={(e) => onChange(field.key, e.target.checked ? "true" : "")}
          />
          <span className="text-xs sm:text-sm text-white/80 font-medium">{field.label}</span>
        </label>
      ) : field.type === "file" ? (
        <input
          type="file"
          name={field.key}
          required={field.required}
          className="w-full bg-black/50 border border-white/15 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-purple-500/50 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer text-xs"
        />
      ) : (
        <input
          type={field.type === "phone" ? "tel" : field.type}
          name={field.key}
          required={field.required}
          placeholder={`Enter ${field.label.toLowerCase()}`}
          className={INPUT_BASE}
          onChange={(e) => onChange(field.key, e.target.value)}
        />
      )}
    </div>
  );
}

interface Props {
  event: DynamicEvent;
  formSchema: DynamicFormSchema;
  upiId: string | null;
  qrCodeUrl?: string | null | undefined;
}

export default function DynamicRegistrationForm({ event, formSchema, upiId, qrCodeUrl }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const onChange = (k: string, v: string) => setValues((p) => ({ ...p, [k]: v }));

  // Filter out payment fields if they exist in schema so they are handled cleanly in the Payment block
  const hasPaymentInSchema = formSchema.fields.some(
    (f) =>
      f.key === "transaction_id" ||
      f.key === "transactionId" ||
      f.key === "payment_screenshot" ||
      f.key === "paymentScreenshot"
  );

  const shouldRenderPayment = (event.registration?.requiresPayment ?? false) || hasPaymentInSchema;

  const generalFields = formSchema.fields.filter(
    (f) =>
      !shouldRenderPayment ||
      (f.key !== "transaction_id" &&
        f.key !== "transactionId" &&
        f.key !== "payment_screenshot" &&
        f.key !== "paymentScreenshot")
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    fd.set("eventId", event.id);

    // Sync snake_case custom schema fields with backend expectations
    if (!fd.get("paymentScreenshot") && fd.get("payment_screenshot")) {
      fd.set("paymentScreenshot", fd.get("payment_screenshot") as File);
    }
    if (!fd.get("transactionId") && fd.get("transaction_id")) {
      fd.set("transactionId", fd.get("transaction_id") as string);
    }

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
      <div className="bg-[#0b0b14]/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(147,51,234,0.2)] p-6 sm:p-10 md:p-12 text-center relative overflow-hidden font-sans">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 sm:h-24 sm:w-24 bg-emerald-500/20 rounded-full border border-emerald-500/40 flex items-center justify-center animate-bounce">
            <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-400" />
          </div>
        </div>
        <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
          Registration <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">Successful!</span>
        </h2>
        <p className="text-white/80 text-sm sm:text-base md:text-lg mb-8 max-w-lg mx-auto">
          Your squad registration for <strong>{event.title}</strong> has been successfully recorded. Check your email for further instructions.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl border border-purple-400/30 shadow-lg shadow-purple-950/50 transition-all hover:-translate-y-0.5"
        >
          Return to Home Page
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#0b0b14]/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/10 shadow-[0_0_60px_rgba(147,51,234,0.15)] p-4 sm:p-7 md:p-10 relative overflow-hidden font-sans space-y-6 sm:space-y-8"
    >
      {/* Top Banner & Header */}
      <div className="text-center pb-5 sm:pb-8 border-b border-white/10 space-y-2.5 sm:space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] sm:text-xs font-semibold uppercase tracking-widest shadow-sm">
          <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-400" /> Event Registration
        </div>
        <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-extrabold text-white leading-tight">
          Register for{" "}
          <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
            {event.title}
          </span>
        </h2>
        {event.registration?.teamConfig && (
          <p className="text-white/60 text-xs sm:text-sm font-medium">
            Teams of {event.registration.teamConfig.min}–{event.registration.teamConfig.max} members.
          </p>
        )}
      </div>

      {error && (
        <div className="p-3.5 sm:p-4 bg-red-500/10 border border-red-500/50 rounded-xl sm:rounded-2xl flex items-center gap-3 text-red-200 text-xs sm:text-sm">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* 1. General Registration Form Schema Fields */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
        <div className="flex items-center gap-2 pb-2.5 sm:pb-3 border-b border-white/10">
          <User className="w-4 h-4 text-purple-400 flex-shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">Participant & Team Information</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {generalFields.map((field) => (
            <DynField key={field.key} field={field} values={values} onChange={onChange} />
          ))}
        </div>
      </div>

      {/* 2. Payment Section (QR Code + Payment Proof Verification) */}
      {shouldRenderPayment && (
        <DynamicRegistrationFormPayment
          fee={event.registration?.fee ?? 0}
          upiId={upiId}
          qrCodeUrl={qrCodeUrl}
        />
      )}

      {/* 3. Submit Button */}
      <div className="pt-5 sm:pt-6 border-t border-white/10 text-center">
        <button
          disabled={submitting}
          type="submit"
          className="relative inline-flex items-center justify-center w-full sm:w-auto px-8 sm:px-12 py-3.5 sm:py-4 text-sm sm:text-base font-extrabold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-xl hover:from-purple-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:-translate-y-0.5 transition-all"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2.5 h-4 w-4 sm:h-5 sm:w-5 animate-spin text-white" />
              PROCESSING REGISTRATION…
            </>
          ) : (
            "SUBMIT REGISTRATION"
          )}
        </button>
      </div>
    </form>
  );
}
