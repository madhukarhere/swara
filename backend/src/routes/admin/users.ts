import { Router } from 'express';
import mongoose from 'mongoose';
import { z } from 'zod';
import { Admin } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { AppError } from '../../middleware/error';
import { writeAudit } from '../../middleware/audit';
import { paginate } from '../../lib/http';

const router = Router();
const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function serializeUser(a: any) {
  return {
    id: String(a._id),
    username: a.username,
    email: a.email,
    role: a.role,
    lastLoginAt: a.lastLoginAt ?? null,
    createdAt: a.createdAt ?? null,
  };
}

const usernameField = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, 'Username must be at least 3 characters')
  .max(80, 'Username is too long')
  .regex(/^[a-z0-9._-]+$/, 'Use only letters, numbers, dot, underscore or hyphen');
const emailField = z.string().trim().toLowerCase().email('Enter a valid email address').max(160);
const passwordField = z.string().min(8, 'Password must be at least 8 characters').max(200);

/* GET /api/admin/users — list admin accounts */
const listQuery = z.object({
  q: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

router.get(
  '/',
  validate({ query: listQuery }),
  asyncHandler(async (req, res) => {
    const { q, page, limit } = req.valid!.query as z.infer<typeof listQuery>;
    const filter: Record<string, unknown> = {};
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ username: rx }, { email: rx }];
    }
    const [items, total] = await Promise.all([
      Admin.find(filter).sort({ createdAt: 1 }).skip((page - 1) * limit).limit(limit).lean(),
      Admin.countDocuments(filter),
    ]);
    res.json(paginate(items.map(serializeUser), total, page, limit));
  }),
);

/* POST /api/admin/users — create an admin account */
const userCreate = z.object({
  username: usernameField,
  email: emailField,
  password: passwordField,
});

router.post(
  '/',
  validate({ body: userCreate }),
  asyncHandler(async (req, res) => {
    const data = req.body as z.infer<typeof userCreate>;
    if (await Admin.exists({ $or: [{ username: data.username }, { email: data.email }] })) {
      throw new AppError(409, 'A user with that username or email already exists');
    }
    const admin = new Admin({ username: data.username, email: data.email, role: 'ADMIN' });
    await admin.setPassword(data.password);
    await admin.save();
    await writeAudit({ req, action: 'create', entity: 'Admin', entityId: String(admin._id), meta: { username: admin.username } });
    res.status(201).json({ data: serializeUser(admin.toObject()) });
  }),
);

/* PUT /api/admin/users/:id — update username / email */
const userUpdate = z.object({
  username: usernameField.optional(),
  email: emailField.optional(),
});

router.put(
  '/:id',
  validate({ body: userUpdate }),
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'User not found');
    const data = req.body as z.infer<typeof userUpdate>;
    const set: Record<string, unknown> = {};
    if (data.username !== undefined) {
      if (await Admin.exists({ username: data.username, _id: { $ne: req.params.id } })) {
        throw new AppError(409, 'That username is already in use');
      }
      set.username = data.username;
    }
    if (data.email !== undefined) {
      if (await Admin.exists({ email: data.email, _id: { $ne: req.params.id } })) {
        throw new AppError(409, 'That email is already in use');
      }
      set.email = data.email;
    }
    const admin = await Admin.findByIdAndUpdate(req.params.id, { $set: set }, { new: true, runValidators: true });
    if (!admin) throw new AppError(404, 'User not found');
    await writeAudit({ req, action: 'update', entity: 'Admin', entityId: String(admin._id) });
    res.json({ data: serializeUser(admin.toObject()) });
  }),
);

/* POST /api/admin/users/:id/password — set a new password */
const passwordChange = z.object({ password: passwordField });

router.post(
  '/:id/password',
  validate({ body: passwordChange }),
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'User not found');
    const admin = await Admin.findById(req.params.id);
    if (!admin) throw new AppError(404, 'User not found');
    const { password } = req.body as z.infer<typeof passwordChange>;
    await admin.setPassword(password);
    await admin.save();
    await writeAudit({ req, action: 'password', entity: 'Admin', entityId: String(admin._id) });
    res.json({ message: 'Password updated' });
  }),
);

/* DELETE /api/admin/users/:id */
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) throw new AppError(404, 'User not found');
    if (req.admin?.sub === req.params.id) throw new AppError(400, 'You cannot delete the account you are signed in with');
    const admin = await Admin.findById(req.params.id);
    if (!admin) throw new AppError(404, 'User not found');
    const total = await Admin.countDocuments();
    if (total <= 1) throw new AppError(400, 'Cannot delete the only remaining admin account');
    await admin.deleteOne();
    await writeAudit({ req, action: 'delete', entity: 'Admin', entityId: String(admin._id), meta: { username: admin.username } });
    res.json({ message: 'User deleted' });
  }),
);

export default router;
