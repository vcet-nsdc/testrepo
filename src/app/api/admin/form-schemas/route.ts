import { NextRequest } from 'next/server';
import { z } from 'zod';
import { requirePermission } from '@/lib/rbac';
import { ok, fail, handleRouteError } from '@/server/http';
import { connectToDatabase } from '@/lib/mongodb';
import FormSchemaModel from '@/models/FormSchema';

const FieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'email', 'phone', 'select', 'number', 'file', 'checkbox', 'textarea']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  validation: z.object({ min: z.number().optional(), max: z.number().optional(), pattern: z.string().optional() }).optional(),
  conditional: z.object({ fieldKey: z.string(), equals: z.string() }).optional(),
});

const CreateSchema = z.object({
  name: z.string().min(1).max(120),
  fields: z.array(FieldSchema).default([]),
});

export async function GET() {
  const guard = await requirePermission('cms:read');
  if (guard.error) return guard.error;
  try {
    await connectToDatabase();
    const schemas = await FormSchemaModel.find({}, { name: 1, version: 1, fields: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .lean();
    const data = schemas.map((s) => ({
      _id: s._id,
      name: s.name,
      version: s.version,
      fieldCount: s.fields?.length ?? 0,
      createdAt: s.createdAt,
    }));
    return ok(data);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requirePermission('cms:write');
  if (guard.error) return guard.error;
  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = CreateSchema.safeParse(body);
    if (!parsed.success) {
      return fail('VALIDATION', parsed.error.issues.map((i) => i.message).join('; '), 422);
    }
    const schema = await FormSchemaModel.create({
      ...parsed.data,
      version: 1,
      createdBy: guard.ctx.userId,
    });
    return ok(schema, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
