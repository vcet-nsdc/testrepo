import { NextRequest } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { requirePermission } from '@/lib/rbac';
import { ok, fail, handleRouteError } from '@/server/http';
import { ALL_ROLES } from '@/config/roles';

const patchSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(ALL_ROLES as [string, ...string[]]).optional(),
}).refine((d) => d.isActive !== undefined || d.role !== undefined, {
  message: 'Provide at least one field to update',
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermission('admin:manage');
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    await connectToDatabase();

    const body = await req.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return fail('VALIDATION', parsed.error.errors[0]?.message ?? 'Invalid input', 422);
    }

    const { isActive, role } = parsed.data;

    // Prevent self-deactivation
    if (id === guard.ctx.userId && isActive === false) {
      return fail('FORBIDDEN', 'Cannot deactivate your own account', 403);
    }

    const update: Record<string, unknown> = {};
    if (isActive !== undefined) update.isActive = isActive;
    if (role !== undefined) update.role = role;

    const user = await User.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, select: '-passwordHash', runValidators: true }
    ).lean();

    if (!user) return fail('NOT_FOUND', 'User not found', 404);

    return ok(user);
  } catch (error) {
    return handleRouteError(error);
  }
}
