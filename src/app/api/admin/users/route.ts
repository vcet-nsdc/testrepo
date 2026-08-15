import { NextRequest } from 'next/server';
import { z } from 'zod';
import bcryptjs from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { requirePermission } from '@/lib/rbac';
import { ok, fail, paginated, getPagination, handleRouteError } from '@/server/http';
import { ALL_ROLES } from '@/config/roles';
import type { FilterQuery } from 'mongoose';
import type { IUser } from '@/models/User';

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(ALL_ROLES as [string, ...string[]]),
});

const PROJECTION = { passwordHash: 0 } as const;

export async function GET(req: NextRequest) {
  const guard = await requirePermission('admin:manage');
  if (guard.error) return guard.error;

  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const pagination = getPagination(searchParams, 50);
    const role = searchParams.get('role');

    const filter: FilterQuery<IUser> = {};
    if (role && ALL_ROLES.includes(role as IUser['role'])) filter.role = role;

    const [users, total] = await Promise.all([
      User.find(filter, PROJECTION).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit).lean(),
      User.countDocuments(filter),
    ]);

    return paginated(users, total, pagination);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: NextRequest) {
  const guard = await requirePermission('admin:manage');
  if (guard.error) return guard.error;

  try {
    await connectToDatabase();
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return fail('VALIDATION', parsed.error.errors[0]?.message ?? 'Invalid input', 422);
    }

    const { name, email, password, role } = parsed.data;

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return fail('CONFLICT', 'Email already in use', 409);

    const passwordHash = await bcryptjs.hash(password, 12);
    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      isActive: true,
      createdBy: guard.ctx.userId,
    });

    const { passwordHash: _omit, ...safeUser } = user.toObject(); // eslint-disable-line @typescript-eslint/no-unused-vars
    return ok(safeUser, 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
