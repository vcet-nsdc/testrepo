import { Types } from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Registration from '@/models/Registration';
import type { PaymentStatus, RegistrationStatus } from '@/models/Registration';
import { recordAudit } from '@/server/services/auditService';

export interface ActorMeta {
  userId: string;
  role: string;
  ip?: string | undefined;
  userAgent?: string | undefined;
}

export type ReviewAction = 'approve' | 'reject' | 'waitlist';
export type PaymentAction = 'verify-payment' | 'reject-payment';

const STATUS_BY_ACTION: Record<ReviewAction, RegistrationStatus> = {
  approve: 'approved',
  reject: 'rejected',
  waitlist: 'waitlisted',
};

// Helper to reliably extract email from leader or custom formData fields
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractEmailFromRegistration(reg: any): string {
  if (reg.leader?.email && reg.leader.email !== 'no-email@registration.local' && reg.leader.email.includes('@')) {
    return reg.leader.email.trim();
  }
  if (reg.formData && typeof reg.formData === 'object') {
    for (const [key, val] of Object.entries(reg.formData)) {
      if (typeof val === 'string' && val.includes('@') && val.includes('.')) {
        const k = key.toLowerCase();
        if (k.includes('email') || k.includes('mail') || k.includes('contact')) {
          return val.trim();
        }
      }
    }
    for (const val of Object.values(reg.formData)) {
      if (typeof val === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
        return val.trim();
      }
    }
  }
  return '';
}

// Helper to reliably extract name from leader or custom formData fields
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractNameFromRegistration(reg: any): string {
  if (reg.leader?.fullName && reg.leader.fullName !== 'Participant' && reg.leader.fullName.trim()) {
    return reg.leader.fullName.trim();
  }
  if (reg.formData && typeof reg.formData === 'object') {
    for (const [key, val] of Object.entries(reg.formData)) {
      if (typeof val === 'string' && val.trim()) {
        const k = key.toLowerCase();
        if (k.includes('name') || k.includes('leader') || k.includes('participant')) {
          return val.trim();
        }
      }
    }
  }
  return reg.squadName || 'Participant';
}

export async function reviewRegistration(
  id: string,
  action: ReviewAction,
  actor: ActorMeta,
  note?: string
) {
  await connectToDatabase();
  const reg = await Registration.findById(id);
  if (!reg) return null;

  // Guard: cannot approve a registration whose payment was rejected.
  if (action === 'approve' && reg.payment?.status === 'rejected') {
    return { error: 'PAYMENT_REJECTED' as const };
  }

  const before = { status: reg.status };
  reg.status = STATUS_BY_ACTION[action];
  reg.certificateEligible = action === 'approve';
  reg.reviewedBy = new Types.ObjectId(actor.userId);
  reg.reviewedAt = new Date();
  if (note) reg.payment.note = note;
  await reg.save();

  await recordAudit({
    actorId: actor.userId,
    actorRole: actor.role,
    action: `registration.${action}`,
    resource: { type: 'registration', id },
    before,
    after: { status: reg.status },
    ip: actor.ip,
    userAgent: actor.userAgent,
  });

  if (action === 'approve') {
    try {
      const { sendRegistrationApprovedEmail } = await import('@/lib/email');
      const populated = await Registration.findById(id).populate('eventId', 'title').lean();
      const eventTitle = (populated?.eventId as unknown as { title?: string })?.title || 'Event';
      
      const email = extractEmailFromRegistration(reg);
      const name = extractNameFromRegistration(reg);

      if (email && email.includes('@')) {
        await sendRegistrationApprovedEmail({
          email,
          name,
          squadName: reg.squadName,
          eventTitle,
        });
        console.log(`[Registration Service] Approval email sent to ${email}`);
      } else {
        console.warn(`[Registration Service] No valid email found for registration ${id} approval notice.`);
      }
    } catch (e) {
      console.error('[Registration Service] Failed to send approval email:', e);
    }
  } else if (action === 'reject') {
    try {
      const { sendRegistrationRejectedEmail } = await import('@/lib/email');
      const populated = await Registration.findById(id).populate('eventId', 'title').lean();
      const eventTitle = (populated?.eventId as unknown as { title?: string })?.title || 'Event';
      
      const email = extractEmailFromRegistration(reg);
      const name = extractNameFromRegistration(reg);

      if (email && email.includes('@')) {
        await sendRegistrationRejectedEmail({
          email,
          name,
          squadName: reg.squadName,
          eventTitle,
          reason: note,
        });
        console.log(`[Registration Service] Rejection email sent to ${email}`);
      } else {
        console.warn(`[Registration Service] No valid email found for registration ${id} rejection notice.`);
      }
    } catch (e) {
      console.error('[Registration Service] Failed to send rejection email:', e);
    }
  }

  return { data: reg.toObject() };
}

export async function setPaymentStatus(
  id: string,
  action: PaymentAction,
  actor: ActorMeta,
  note?: string
) {
  await connectToDatabase();
  const reg = await Registration.findById(id);
  if (!reg) return null;

  const status: PaymentStatus = action === 'verify-payment' ? 'verified' : 'rejected';
  const before = { payment: reg.payment?.status };
  reg.payment.status = status;
  reg.payment.verifiedBy = new Types.ObjectId(actor.userId);
  reg.payment.verifiedAt = new Date();
  if (note) reg.payment.note = note;
  await reg.save();

  await recordAudit({
    actorId: actor.userId,
    actorRole: actor.role,
    action: `payment.${status}`,
    resource: { type: 'registration', id },
    before,
    after: { payment: status },
    ip: actor.ip,
    userAgent: actor.userAgent,
  });

  return { data: reg.toObject() };
}
