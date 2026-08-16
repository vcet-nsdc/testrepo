import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { requirePermission } from '@/lib/rbac';
import { ok, handleRouteError } from '@/server/http';

export async function GET(_req: NextRequest) {
  const guard = await requirePermission('registration:read');
  if (guard.error) return guard.error;

  try {
    await connectToDatabase();

    const stats = await Registration.aggregate([
      {
        $group: {
          _id: '$eventId',
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          waitlisted: { $sum: { $cond: [{ $eq: ['$status', 'waitlisted'] }, 1, 0] } },
        },
      },
    ]);

    // Format stats as key-value map keyed by eventId string (or 'unspecified')
    const statsMap: Record<string, { total: number; pending: number; approved: number; rejected: number; waitlisted: number }> = {};
    let grandTotal = 0;
    let grandPending = 0;
    let grandApproved = 0;

    for (const item of stats) {
      const key = item._id ? item._id.toString() : 'unspecified';
      statsMap[key] = {
        total: item.total || 0,
        pending: item.pending || 0,
        approved: item.approved || 0,
        rejected: item.rejected || 0,
        waitlisted: item.waitlisted || 0,
      };
      grandTotal += item.total || 0;
      grandPending += item.pending || 0;
      grandApproved += item.approved || 0;
    }

    return ok({
      byEvent: statsMap,
      grandTotal,
      grandPending,
      grandApproved,
    });
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}
