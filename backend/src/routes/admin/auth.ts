import { Router } from 'express';
import { z } from 'zod';
import { Admin } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { authLimiter } from '../../middleware/rateLimit';
import { requireAdmin, ADMIN_COOKIE } from '../../middleware/auth';
import { signAdminToken } from '../../lib/jwt';
import { AppError } from '../../middleware/error';
import { env } from '../../config/env';
import { writeAudit } from '../../middleware/audit';

const router = Router();

const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: env.COOKIE_SECURE,
  path: '/',
  maxAge: 7 * 24 * 3600 * 1000,
};

/* GET /api/admin/csrf — hands the client a CSRF token (cookie set by middleware). */
router.get('/csrf', (_req, res) => {
  res.json({ csrfToken: res.locals.csrfToken });
});

/* POST /api/admin/login */
const loginBody = z.object({
  username: z.string().trim().min(1).max(80),
  password: z.string().min(1).max(200),
});

router.post(
  '/login',
  authLimiter,
  validate({ body: loginBody }),
  asyncHandler(async (req, res) => {
    const { username, password } = req.body as z.infer<typeof loginBody>;
    const admin = await Admin.findOne({ username: username.toLowerCase() }).select('+passwordHash');
    if (!admin || !(await admin.verifyPassword(password))) {
      throw new AppError(401, 'Invalid username or password');
    }
    admin.lastLoginAt = new Date();
    await admin.save();

    const token = signAdminToken({ sub: String(admin._id), username: admin.username, role: 'ADMIN' });
    res.cookie(ADMIN_COOKIE, token, COOKIE_OPTS);
    await writeAudit({ req, action: 'login', entity: 'Admin', entityId: String(admin._id) });

    res.json({
      token,
      admin: { id: String(admin._id), username: admin.username, email: admin.email, role: admin.role },
    });
  }),
);

/* POST /api/admin/logout */
router.post(
  '/logout',
  requireAdmin,
  asyncHandler(async (req, res) => {
    res.clearCookie(ADMIN_COOKIE, { path: '/' });
    await writeAudit({ req, action: 'logout', entity: 'Admin', entityId: req.admin?.sub });
    res.json({ message: 'Logged out' });
  }),
);

/* GET /api/admin/me */
router.get(
  '/me',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const admin = await Admin.findById(req.admin!.sub).lean();
    if (!admin) throw new AppError(401, 'Session no longer valid');
    res.json({
      admin: {
        id: String(admin._id),
        username: admin.username,
        email: admin.email,
        role: admin.role,
        lastLoginAt: admin.lastLoginAt ?? null,
      },
    });
  }),
);

export default router;
