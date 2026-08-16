import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Registration from '@/models/Registration';
import EventModel from '@/models/EventModel';
import { requirePermission } from '@/lib/rbac';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  const guard = await requirePermission('registration:export');
  if (guard.error) return guard.error;

  try {
    await connectToDatabase();
    void EventModel;

    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const domain = searchParams.get('domain');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: Record<string, any> = {};
    if (eventId && eventId !== 'all' && Types.ObjectId.isValid(eventId)) {
      filter.eventId = new Types.ObjectId(eventId);
    }
    if (domain && domain !== 'all') {
      filter.domain = domain;
    }

    const registrations = await Registration.find(filter)
      .populate('eventId', 'title slug')
      .select('-paymentScreenshot')
      .sort({ createdAt: -1 })
      .lean();

    // Build flat rows for Excel
    interface RegistrationDoc {
      _id: string;
      eventId?: { _id: string; title: string; slug: string };
      squadName: string;
      domain: string;
      leader: { fullName: string; email: string; phone: string; college: string };
      members: { fullName: string; email: string }[];
      transactionId: string;
      paymentScreenshot?: string;
      formData?: Record<string, unknown>;
      createdAt: Date;
    }

    const origin = req.nextUrl.origin;
    const rows = (registrations as unknown as RegistrationDoc[]).map((r, i) => {
      const rowObj: Record<string, unknown> = {
        'S.No': i + 1,
        'Event': r.eventId?.title || 'General / Unspecified',
        'Squad Name': r.squadName !== 'Squad' ? r.squadName : String(r.formData?.name || r.formData?.squad_name || r.squadName),
        'Domain': r.domain,
        'Leader Name': r.leader?.fullName !== 'Participant' ? r.leader?.fullName : String(r.formData?.name || r.leader?.fullName),
        'Leader Email': r.leader?.email !== 'no-email@registration.local' ? r.leader?.email : String(r.formData?.email || r.leader?.email),
        'Leader Phone': r.leader?.phone || '',
        'College': r.leader?.college || '',
        'Transaction ID': r.transactionId,
        'Screenshot URL': `${origin}/api/admin/screenshot/${r._id}`,
        'Registered At': r.createdAt ? new Date(r.createdAt).toLocaleString('en-IN') : '',
      };

      if (r.formData && typeof r.formData === 'object') {
        Object.entries(r.formData).forEach(([k, v]) => {
          rowObj[`Form: ${k}`] = v;
        });
      }

      return rowObj;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Registrations');

    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="registrations_${eventId || domain || 'all'}_${Date.now()}.xlsx"`,
      },
    });
  } catch (error: unknown) {
    console.error('Export Error:', error);
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
