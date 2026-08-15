import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePermission } from '@/lib/rbac';
import { ok, fail, handleRouteError } from '@/server/http';
import { connectToDatabase } from '@/lib/mongodb';
import EventTheme from '@/models/EventTheme';
import EventModel from '@/models/EventModel';

const sectionSchema = z.object({
  type: z.enum(['hero', 'about', 'schedule', 'sponsors', 'gallery', 'faq', 'register']),
  enabled: z.boolean().default(true),
  order: z.number().int().default(0),
  config: z.record(z.unknown()).optional(),
});

const themeUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  category: z.enum(['hackathon', 'workshop', 'webinar', 'bootcamp', 'competition', 'custom']).optional(),
  description: z.string().max(500).optional(),
  layout: z.object({ sections: z.array(sectionSchema) }).optional(),
  isActive: z.boolean().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: RouteContext) {
  const guard = await requirePermission('theme:manage');
  if (guard.error) return guard.error;
  try {
    await connectToDatabase();
    const { id } = await params;
    const theme = await EventTheme.findById(id).lean();
    if (!theme) return fail('NOT_FOUND', 'Theme not found', 404);
    return ok(theme);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const guard = await requirePermission('theme:manage');
  if (guard.error) return guard.error;
  try {
    await connectToDatabase();
    const { id } = await params;
    const body = await req.json();
    const parsed = themeUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return fail('VALIDATION', parsed.error.issues.map((i) => i.message).join('; '), 422);
    }
    if (parsed.data.slug) {
      const conflict = await EventTheme.exists({ slug: parsed.data.slug, _id: { $ne: id } });
      if (conflict) return fail('CONFLICT', 'A theme with this slug already exists', 409);
    }
    const theme = await EventTheme.findByIdAndUpdate(id, { $set: parsed.data }, { new: true }).lean();
    if (!theme) return fail('NOT_FOUND', 'Theme not found', 404);
    return ok(theme);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  const guard = await requirePermission('theme:manage');
  if (guard.error) return guard.error;
  try {
    await connectToDatabase();
    const { id } = await params;
    const referenced = await EventModel.exists({ themeId: id });
    if (referenced) {
      return fail('CONFLICT', 'Cannot delete theme: one or more events reference it', 409);
    }
    const deleted = await EventTheme.findByIdAndDelete(id).lean();
    if (!deleted) return fail('NOT_FOUND', 'Theme not found', 404);
    return ok({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
