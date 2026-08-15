import DynamicRegistrationForm from "@/components/DynamicRegistrationForm";
import type { DynamicEvent, DynamicFormSchema } from "@/components/DynamicRegistrationForm";

async function getActiveEvent(): Promise<{
  event: DynamicEvent | null;
  formSchema: DynamicFormSchema | null;
  upiId: string | null;
}> {
  // Call services directly — we are in a Server Component
  const { connectToDatabase } = await import("@/lib/mongodb");
  const { default: EventModel } = await import("@/models/EventModel");
  const { getSettings } = await import("@/server/services/settingsService");

  await connectToDatabase();

  const now = new Date();
  const raw = await EventModel.findOne({
    status: "published",
    "registration.enabled": true,
    $or: [
      { "registration.closesAt": null },
      { "registration.closesAt": { $exists: false } },
      { "registration.closesAt": { $gt: now } },
    ],
  })
    .populate("registration.formSchemaId")
    .lean();

  if (!raw) return { event: null, formSchema: null, upiId: null };

  const businessSettings = await getSettings("business");
  const upiId = (businessSettings.upiId as string) ?? null;

  const schemaDoc = raw.registration.formSchemaId as unknown as {
    _id: { toString(): string };
    name: string;
    fields: DynamicFormSchema["fields"];
  } | null;

  const formSchema: DynamicFormSchema | null = schemaDoc
    ? { id: schemaDoc._id.toString(), name: schemaDoc.name, fields: schemaDoc.fields }
    : null;

  const event: DynamicEvent = {
    id: raw._id.toString(),
    title: raw.title,
    registration: {
      fee: raw.registration.fee,
      requiresPayment: raw.registration.requiresPayment,
      teamConfig: raw.registration.teamConfig ?? null,
      formSchemaId: schemaDoc ? schemaDoc._id.toString() : null,
    },
  };

  return { event, formSchema, upiId };
}

export default async function RegisterPage() {
  const { event, formSchema, upiId } = await getActiveEvent();

  if (!event || !formSchema) {
    return (
      <div className="min-h-full w-full overflow-x-hidden">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-20">
          <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl p-8 sm:p-12 text-center">
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-4 text-white">
              Registrations{" "}
              <span className="bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Closed
              </span>
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto text-lg font-sans">
              Registrations are not open at the moment. Check back soon!
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-full w-full overflow-x-hidden">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-32 pb-20">
        <DynamicRegistrationForm event={event} formSchema={formSchema} upiId={upiId} />
      </main>
    </div>
  );
}
