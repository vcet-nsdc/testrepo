"use client";

import React, { useState, useMemo, useCallback } from "react";
import { CheckCircle2, Loader2, AlertCircle, Sparkles, User, Users, ShieldCheck } from "lucide-react";
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
  "w-full bg-white/[0.07] hover:bg-white/[0.1] focus:bg-white/[0.14] border border-white/20 focus:border-purple-400 text-white placeholder-white/45 rounded-xl px-4 py-3 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-purple-500/40 transition-all font-sans shadow-inner";

// Fast, memoized field component to eliminate mobile typing re-render lag
const DynField = React.memo(function DynField({
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
    <div className={`space-y-1.5 font-sans ${isFullWidth ? "md:col-span-2" : ""}`}>
      <label className="text-[11px] sm:text-xs font-bold text-purple-200/90 uppercase tracking-wider block">
        {field.label}
        {field.required && <span className="text-pink-400 ml-1 font-bold">*</span>}
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
          className={`${INPUT_BASE} cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat pr-10 [&>option]:bg-zinc-950 [&>option]:text-white`}
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
        <label className="flex items-center gap-3 p-3 bg-white/[0.06] border border-white/20 rounded-xl cursor-pointer hover:border-purple-400 transition-colors">
          <input
            type="checkbox"
            name={field.key}
            required={field.required}
            className="w-4 h-4 rounded accent-purple-500 cursor-pointer"
            onChange={(e) => onChange(field.key, e.target.checked ? "true" : "")}
          />
          <span className="text-xs sm:text-sm text-white font-medium">{field.label}</span>
        </label>
      ) : field.type === "file" ? (
        <input
          type="file"
          name={field.key}
          required={field.required}
          className="w-full bg-white/[0.06] border border-white/20 rounded-xl p-2.5 text-white outline-none focus:ring-2 focus:ring-purple-500/40 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer text-xs"
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
});

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

  const onChange = useCallback((k: string, v: string) => {
    setValues((p) => ({ ...p, [k]: v }));
  }, []);

  const hasPaymentInSchema = useMemo(
    () =>
      formSchema.fields.some(
        (f) =>
          f.key === "transaction_id" ||
          f.key === "transactionId" ||
          f.key === "payment_screenshot" ||
          f.key === "paymentScreenshot"
      ),
    [formSchema.fields]
  );

  const shouldRenderPayment = (event.registration?.requiresPayment ?? false) || hasPaymentInSchema;

  const generalFields = useMemo(
    () =>
      formSchema.fields.filter(
        (f) =>
          !shouldRenderPayment ||
          (f.key !== "transaction_id" &&
            f.key !== "transactionId" &&
            f.key !== "payment_screenshot" &&
            f.key !== "paymentScreenshot")
      ),
    [formSchema.fields, shouldRenderPayment]
  );

  const { squadFields, memberGroups, otherFields } = useMemo(() => {
    const squad: FormField[] = [];
    const members: Record<number, { title: string; fields: FormField[] }> = {};
    const others: FormField[] = [];

    const getMemberNum = (k: string, l: string): number | null => {
      const combined = (k + " " + l).toLowerCase();
      if (combined.includes("leader") || combined.includes("member1") || combined.includes("member_1") || combined.includes("member 1")) {
        return 1;
      }
      const match = combined.match(/member[_\s]?(\d+)/i);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
      return null;
    };

    const isSquad = (k: string, l: string): boolean => {
      const combined = (k + " " + l).toLowerCase();
      return (
        combined.includes("squad") ||
        combined.includes("team name") ||
        combined.includes("team_name") ||
        combined.includes("domain") ||
        combined.includes("category")
      );
    };

    for (const f of generalFields) {
      const memNum = getMemberNum(f.key, f.label);
      if (memNum !== null) {
        if (!members[memNum]) {
          const title = memNum === 1 ? "Member 1 (Team Leader)" : `Member ${memNum}`;
          members[memNum] = { title, fields: [] };
        }
        members[memNum]!.fields.push(f);
      } else if (isSquad(f.key, f.label)) {
        squad.push(f);
      } else {
        others.push(f);
      }
    }

    return { squadFields: squad, memberGroups: members, otherFields: others };
  }, [generalFields]);

  const memberKeys = useMemo(
    () => Object.keys(memberGroups).map(Number).sort((a, b) => a - b),
    [memberGroups]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    fd.set("eventId", event.id);

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
      <div className="bg-[#0c081e]/85 backdrop-blur-xl rounded-3xl border border-purple-500/40 p-6 sm:p-10 md:p-12 text-center font-sans shadow-[0_0_80px_rgba(147,51,234,0.3)]">
        <div className="flex justify-center mb-6">
          <div className="h-20 w-20 sm:h-24 sm:w-24 bg-emerald-500/20 rounded-full border border-emerald-400/50 flex items-center justify-center animate-pulse">
            <CheckCircle2 className="h-10 w-10 sm:h-12 sm:w-12 text-emerald-400" />
          </div>
        </div>
        <h2 className="font-heading text-2xl sm:text-4xl md:text-5xl font-bold mb-4 text-white">
          Registration <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-200 bg-clip-text text-transparent">Successful!</span>
        </h2>
        <p className="text-white/90 text-sm sm:text-base md:text-lg mb-8 max-w-lg mx-auto">
          Your squad registration for <strong>{event.title}</strong> has been successfully recorded. Check your email for further instructions.
        </p>
        <button
          onClick={() => (window.location.href = "/")}
          className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl border border-purple-300/40 shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-transform active:scale-95"
        >
          Return to Home Page
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#0c081e]/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-purple-500/35 shadow-[0_0_80px_rgba(147,51,234,0.25)] p-5 sm:p-8 md:p-12 relative overflow-hidden font-sans space-y-7"
    >
      {/* Top Banner & Header */}
      <div className="text-center pb-6 sm:pb-8 border-b border-purple-500/25 space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-purple-600/30 via-pink-600/30 to-indigo-600/30 border border-purple-400/50 text-purple-200 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest shadow-[0_0_20px_rgba(168,85,247,0.35)]">
          <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" /> Event Registration
        </div>
        <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl font-black text-white leading-tight tracking-tight">
          Register for{" "}
          <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-200 bg-clip-text text-transparent drop-shadow-sm">
            {event.title}
          </span>
        </h2>
        {event.registration?.teamConfig && (
          <p className="text-purple-200/80 text-xs sm:text-sm font-semibold">
            Teams of {event.registration.teamConfig.min}–{event.registration.teamConfig.max} members.
          </p>
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-500/15 border border-red-500/60 rounded-2xl flex items-center gap-3 text-red-200 text-xs sm:text-sm shadow-lg">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* 1. Squad / Team Header Fields (if present) */}
      {squadFields.length > 0 && (
        <div className="bg-purple-950/20 backdrop-blur-md border border-purple-500/35 hover:border-purple-400/60 rounded-2xl p-5 sm:p-7 space-y-5 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <div className="p-2 rounded-xl bg-purple-500/25 border border-purple-400/40 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
              <Users className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
              Squad / Team Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {squadFields.map((field) => (
              <DynField key={field.key} field={field} values={values} onChange={onChange} />
            ))}
          </div>
        </div>
      )}

      {/* 2. Structured Glassmorphic Card Box Per Member (M1, M2, M3...) */}
      {memberKeys.length > 0 ? (
        memberKeys.map((num) => {
          const group = memberGroups[num]!;
          return (
            <div
              key={num}
              className="bg-purple-950/20 backdrop-blur-md border border-purple-500/35 hover:border-purple-400/60 rounded-2xl p-5 sm:p-7 space-y-5 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/25 border border-purple-400/40 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
                    <User className="w-4 h-4" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
                    {group.title}
                  </h3>
                </div>
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white font-mono font-extrabold px-3 py-1 rounded-lg text-xs shadow-md border border-purple-300/40">
                  M{num}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {group.fields.map((field) => (
                  <DynField key={field.key} field={field} values={values} onChange={onChange} />
                ))}
              </div>
            </div>
          );
        })
      ) : (
        /* Fallback if no member-specific naming pattern is detected */
        <div className="bg-purple-950/20 backdrop-blur-md border border-purple-500/35 hover:border-purple-400/60 rounded-2xl p-5 sm:p-7 space-y-5 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <div className="p-2 rounded-xl bg-purple-500/25 border border-purple-400/40 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
              <User className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
              Participant Details
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {generalFields.map((field) => (
              <DynField key={field.key} field={field} values={values} onChange={onChange} />
            ))}
          </div>
        </div>
      )}

      {/* 3. Other General Fields (if any) */}
      {otherFields.length > 0 && (
        <div className="bg-purple-950/20 backdrop-blur-md border border-purple-500/35 hover:border-purple-400/60 rounded-2xl p-5 sm:p-7 space-y-5 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
            <div className="p-2 rounded-xl bg-purple-500/25 border border-purple-400/40 text-purple-200 shadow-[0_0_12px_rgba(168,85,247,0.35)]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="text-xs sm:text-sm font-extrabold text-white uppercase tracking-wider">
              Additional Information
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {otherFields.map((field) => (
              <DynField key={field.key} field={field} values={values} onChange={onChange} />
            ))}
          </div>
        </div>
      )}

      {/* 4. Payment Section (QR Code + Payment Proof Verification) */}
      {shouldRenderPayment && (
        <DynamicRegistrationFormPayment
          fee={event.registration?.fee ?? 0}
          upiId={upiId}
          qrCodeUrl={qrCodeUrl}
        />
      )}

      {/* 5. Submit Button */}
      <div className="pt-6 border-t border-purple-500/25 text-center">
        <button
          disabled={submitting}
          type="submit"
          className="relative inline-flex items-center justify-center w-full sm:w-auto px-10 sm:px-14 py-4 text-sm sm:text-base font-black text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 hover:from-purple-500 hover:via-indigo-500 hover:to-pink-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:shadow-[0_0_55px_rgba(168,85,247,0.7)] transition-all active:scale-95 border border-purple-300/40"
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
