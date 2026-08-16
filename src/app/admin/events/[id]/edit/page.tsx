"use client";

import { use, useEffect, useState } from "react";
import EventForm from "@/components/admin/EventForm";

interface Event {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  startsAt?: string;
  endsAt?: string;
  venue?: string;
  summary?: string;
  content?: string;
  coverImage?: string;
  registration: {
    enabled: boolean;
    fee: number;
    requiresPayment: boolean;
    requiresApproval: boolean;
    teamConfig?: { min: number; max: number };
    formSchemaId?: string;
  };
  highlights: string[];
  faqs: { q: string; a: string }[];
}

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/admin/events/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setEvent(d.data);
        else setError(d.error?.message || "Not found");
      })
      .catch(() => setError("Failed to load event"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="max-w-3xl space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-16 bg-white/[0.03] border border-white/[0.06] rounded-xl animate-pulse" />
      ))}
    </div>
  );

  if (error || !event) return (
    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">{error || "Event not found"}</div>
  );

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Edit Event</h2>
        <p className="text-white/40 text-sm mt-1 font-mono">/{event.slug}</p>
      </div>
      <EventForm
        eventId={id}
        initial={{
          title: event.title,
          slug: event.slug,
          status: event.status,
          startsAt: event.startsAt ? new Date(event.startsAt).toISOString().slice(0, 16) : "",
          endsAt: event.endsAt ? new Date(event.endsAt).toISOString().slice(0, 16) : "",
          venue: event.venue ?? "",
          summary: event.summary ?? "",
          content: event.content ?? "",
          coverImage: event.coverImage ?? "",
          registrationEnabled: event.registration?.enabled ?? false,
          registrationFee: event.registration?.fee ?? 0,
          requiresPayment: event.registration?.requiresPayment ?? false,
          requiresApproval: event.registration?.requiresApproval ?? true,
          teamMin: event.registration?.teamConfig?.min ?? 1,
          teamMax: event.registration?.teamConfig?.max ?? 4,
          formSchemaId: event.registration?.formSchemaId ?? "",
          highlights: event.highlights ?? [],
          faqs: event.faqs ?? [],
        }}
      />
    </div>
  );
}
