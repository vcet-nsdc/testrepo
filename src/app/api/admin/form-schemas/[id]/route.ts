import { NextRequest } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import { requirePermission } from '@/lib/rbac';
import { ok, fail, handleRouteError } from '@/server/http';
import { connectToDatabase } from '@/lib/mongodb';
import FormSchemaModel from '@/models/FormSchema';

type Ctx = { params: Promise<{ id: string }> };

const FieldSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'email', 'phone', 'select', 'number', 'file', 'checkbox', 'textarea']),
  required: z.boolean().default(false),
  options: z.array(z.string()).optional(),
  validation: z.object({ min: z.number().optional(), max: z.number().optional(), pattern: z.string().optional() }).optional(),
  conditional: z.object({ fieldKey: z.string(), equals: z.string() }).optional(),
});

const PatchSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  fields: z.array(FieldSchema).optional(),
});

function validId(id: string) {
  return mongoose.Types.ObjectId.isValid(id);
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const guard = await requirePermission('cms:read');
  if (guard.error) return guard.error;
  try {
    const { id } = await params;
    if (!validId(id)) return fail('NOT_FOUND', 'Schema not found', 404);
    await connectToDatabase();
    const schema = await FormSchemaModel.findById(id).lean();
    if (!schema) return fail('NOT_FOUND', 'Schema not found', 404);
    return ok(schema);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  let guard = await requirePermission('cms:write');
  if (guard.error) {
    guard = await requirePermission('event:update');
    if (guard.error) return guard.error;
  }
  try {
    const { id } = await params;
    if (!validId(id)) return fail('NOT_FOUND', 'Schema not found', 404);
    await connectToDatabase();
    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return fail('VALIDATION', parsed.error.issues.map((i) => i.message).join('; '), 422);
    }
    const update: Record<string, unknown> = { $inc: { version: 1 } };
    const set: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) set.name = parsed.data.name;
    if (parsed.data.fields !== undefined) set.fields = parsed.data.fields;
    if (Object.keys(set).length) update.$set = set;
    const schema = await FormSchemaModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!schema) return fail('NOT_FOUND', 'Schema not found', 404);
    return ok(schema);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  let guard = await requirePermission('cms:write');
  if (guard.error) {
    guard = await requirePermission('event:update');
    if (guard.error) return guard.error;
  }
  try {
    const { id } = await params;
    if (!validId(id)) return fail('NOT_FOUND', 'Schema not found', 404);
    await connectToDatabase();
    const schema = await FormSchemaModel.findByIdAndDelete(id).lean();
    if (!schema) return fail('NOT_FOUND', 'Schema not found', 404);
    return ok({ deleted: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
