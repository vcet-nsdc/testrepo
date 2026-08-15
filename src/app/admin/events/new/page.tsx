import EventForm from "@/components/admin/EventForm";

export default function NewEventPage() {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-white">Create Event</h2>
        <p className="text-white/40 text-sm mt-1">New event will be saved as draft until published</p>
      </div>
      <EventForm />
    </div>
  );
}
