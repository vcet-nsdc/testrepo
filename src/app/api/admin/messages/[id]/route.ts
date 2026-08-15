import { NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import Message from '@/models/Message';
import { requirePermission } from '@/lib/rbac';
import { ok, fail, handleRouteError } from '@/server/http';

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requirePermission('cms:write');
  if (guard.error) return guard.error;

  try {
    const { id } = await params;
    await connectToDatabase();

    const deleted = await Message.findByIdAndDelete(id);
    if (!deleted) return fail('NOT_FOUND', 'Message not found', 404);

    return ok({ deleted: true });
  } catch (error: unknown) {
    return handleRouteError(error);
  }
}
