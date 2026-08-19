import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { rateLimit } from '@/lib/rate-limit';
import { sanitizeText, sanitizeEmail } from '@/lib/sanitize';
import Registration from '@/models/Registration';
import EventModel from '@/models/EventModel';

export async function POST(req: NextRequest) {
  try {
    // Rate limit: 5 registrations per 10 minutes per IP
    const limited = await rateLimit(req, { name: 'register', limit: 5, windowMs: 10 * 60 * 1000 });
    if (limited) return limited;

    await connectToDatabase();

    const rawFormData = await req.formData();
    const eventId = rawFormData.get('eventId') as string | null;

    let requiresPayment = false;
    let eventTitle = 'Event';

    if (eventId && Types.ObjectId.isValid(eventId)) {
      const ev = await EventModel.findById(eventId).lean();
      if (ev) {
        eventTitle = ev.title;
        requiresPayment = ev.registration?.requiresPayment ?? ((ev.registration?.fee ?? 0) > 0);
      }
    }

    // Collect ALL submitted form entries into a customData dictionary (excluding payment screenshot)
    const customData: Record<string, unknown> = {};
    for (const [key, value] of rawFormData.entries()) {
      if (key === 'paymentScreenshot') continue;
      customData[key] = typeof value === 'string' ? sanitizeText(value) : value;
    }

    // Helper to retrieve value matching various candidate keys
    const getVal = (...keys: string[]) => {
      for (const k of keys) {
        const v = rawFormData.get(k);
        if (typeof v === 'string' && v.trim()) return sanitizeText(v.trim());
      }
      return '';
    };

    const squadName = getVal('squadName', 'squad_name', 'squad', 'teamName', 'team_name', 'name', 'title') || 'Squad';
    const domain = getVal('domain', 'category', 'path') || 'General';
    const leaderFullName = getVal('leaderFullName', 'leader_name', 'fullName', 'full_name', 'name') || 'Participant';
    const rawLeaderEmail = getVal('leaderEmail', 'leader_email', 'email', 'email_address');
    const leaderEmail = rawLeaderEmail ? sanitizeEmail(rawLeaderEmail) : 'no-email@registration.local';
    const leaderPhone = getVal('leaderPhone', 'leader_phone', 'phone', 'contact', 'mobile') || 'N/A';
    const leaderCollege = getVal('leaderCollege', 'leader_college', 'college', 'institute') || 'N/A';
    const transactionId = getVal('transactionId', 'transaction_id', 'txId', 'tx_id') || (requiresPayment ? '' : 'FREE-REGISTRATION');

    if (requiresPayment && !transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required for paid registrations' }, { status: 400 });
    }

    // Handle payment screenshot file
    let paymentScreenshot = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    let file = (rawFormData.get('paymentScreenshot') || rawFormData.get('payment_screenshot')) as File | null;
    if (!file) {
      for (const [k, v] of rawFormData.entries()) {
        if (v instanceof File && v.size > 0 && (k.toLowerCase().includes('screenshot') || k.toLowerCase().includes('payment'))) {
          file = v;
          break;
        }
      }
    }
    if (file && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'Payment screenshot must be under 5MB' }, { status: 400 });
      }
      const bytes = await file.arrayBuffer();
      const base64 = Buffer.from(bytes).toString('base64');
      const mimeType = file.type || 'image/jpeg';
      paymentScreenshot = `data:${mimeType};base64,${base64}`;
    } else if (requiresPayment) {
      return NextResponse.json({ error: 'Payment screenshot is required for paid registrations' }, { status: 400 });
    }

    // Parse team members if present
    const members = [];
    for (let i = 2; i <= 10; i++) {
      const memberName = getVal(`member${i}FullName`, `member_${i}_name`);
      const rawMemberEmail = getVal(`member${i}Email`, `member_${i}_email`);
      const memberEmail = rawMemberEmail ? sanitizeEmail(rawMemberEmail) : '';
      if (memberName || memberEmail) {
        members.push({ fullName: memberName || `Member ${i}`, email: memberEmail });
      }
    }

    // Save registration document
    const newRegistration = new Registration({
      ...(eventId && Types.ObjectId.isValid(eventId) ? { eventId: new Types.ObjectId(eventId) } : {}),
      squadName,
      domain,
      leader: {
        fullName: leaderFullName,
        email: leaderEmail,
        phone: leaderPhone,
        college: leaderCollege,
      },
      members,
      transactionId,
      paymentScreenshot,
      formData: customData,
      status: 'pending',
    });

    await newRegistration.save();

    return NextResponse.json({ success: true, message: `Registration for ${eventTitle} successful!` }, { status: 201 });
  } catch (error: unknown) {
    console.error('Registration API Error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
