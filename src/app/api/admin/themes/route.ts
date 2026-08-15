import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePermission } from '@/lib/rbac';
import { ok, fail, handleRouteError } from '@/server/http';
import { connectToDatabase } from '@/lib/mongodb';
import EventTheme from '@/models/EventTheme';

const sectionSchema = z.object({
  type: z.enum(['hero', 'about', 'schedule', 'sponsors', 'gallery', 'faq', 'register']),
  enabled: z.boolean().default(true),
  order: z.number().int().default(0),
  config: z.record(z.unknown()).optional(),
});

const themeCreateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  category: z.enum(['hackathon', 'workshop', 'webinar', 'bootcamp', 'competition', 'custom']),
  description: z.string().max(500).optional(),
  layout: z.object({ sections: z.array(sectionSchema) }),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  const guard = await requirePermission('theme:manage');
  if (guard.error) return guard.error;
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const filter: Record<string, unknown> = {};
    const isActive = searchParams.get('isActive');
    if (isActive === 'true') filter.isActive = true;
    else if (isActive === 'false') filter.isActive = false;
    const themes = await EventTheme.find(filter).sort({ createdAt: -1 }).lean();
    return ok(themes);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requirePermission('theme:manage');
  if (guard.error) return guard.error;
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = themeCreateSchema.safeParse(body);
    if (!parsed.success) {
      return fail('VALIDATION', parsed.error.issues.map((i) => i.message).join('; '), 422);
    }
    const existing = await EventTheme.exists({ slug: parsed.data.slug });
    if (existing) return fail('CONFLICT', 'A theme with this slug already exists', 409);
    const theme = await EventTheme.create({ ...parsed.data, createdBy: guard.ctx.userId });
    return ok(theme, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
