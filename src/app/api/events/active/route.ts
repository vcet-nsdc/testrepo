import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import EventModel from '@/models/EventModel';
import { getSettings } from '@/server/services/settingsService';

export async function GET() {
  try {
    await connectToDatabase();

    const now = new Date();
    const event = await EventModel.findOne({
      status: 'published',
      'registration.enabled': true,
      $or: [
        { 'registration.closesAt': null },
        { 'registration.closesAt': { $exists: false } },
        { 'registration.closesAt': { $gt: now } },
      ],
    })
      .populate('registration.formSchemaId')
      .lean();

    if (!event) {
      return NextResponse.json({ event: null });
    }

    const businessSettings = await getSettings('business');
    const upiId = (businessSettings.upiId as string) ?? null;

    const formSchemaDoc = event.registration.formSchemaId as unknown as {
      _id: { toString(): string };
      name: string;
      fields: unknown[];
    } | null;

    const formSchema = formSchemaDoc
      ? {
          id: formSchemaDoc._id.toString(),
          name: formSchemaDoc.name,
          fields: formSchemaDoc.fields,
        }
      : null;

    return NextResponse.json({
      event: {
        id: event._id.toString(),
        title: event.title,
        slug: event.slug,
        registration: {
          fee: event.registration.fee,
          teamConfig: event.registration.teamConfig ?? null,
          requiresPayment: event.registration.requiresPayment,
          formSchemaId: formSchemaDoc ? formSchemaDoc._id.toString() : null,
        },
      },
      formSchema,
      upiId,
    });
  } catch (error) {
    console.error('[GET /api/events/active]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
