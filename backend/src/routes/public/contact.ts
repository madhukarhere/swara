import { Router } from 'express';
import { z } from 'zod';
import { ContactMessage } from '../../models';
import { asyncHandler } from '../../middleware/asyncHandler';
import { validate } from '../../middleware/validate';
import { commentLimiter } from '../../middleware/rateLimit';
import { AppError } from '../../middleware/error';
import { verifyCaptcha } from '../../lib/captcha';
import { cleanText } from '../../lib/sanitize';
import { hashIp } from '../../lib/ip';

const router = Router();

const contactBody = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(200),
  mobile: z.union([z.string().trim().max(40), z.literal('')]).optional(),
  category: z.enum(['contribute', 'functionality', 'donation']),
  message: z.string().trim().min(2).max(5000),
  captchaToken: z.string().min(10),
  captchaAnswer: z.string().min(1).max(12),
});

/* POST /api/contact — public contact form (CAPTCHA-gated). */
router.post(
  '/',
  commentLimiter,
  validate({ body: contactBody }),
  asyncHandler(async (req, res) => {
    const b = req.body as z.infer<typeof contactBody>;
    if (!verifyCaptcha(b.captchaToken, b.captchaAnswer)) {
      throw new AppError(400, 'Incorrect or expired CAPTCHA. Please try again.');
    }
    await ContactMessage.create({
      name: cleanText(b.name),
      email: cleanText(b.email),
      mobile: b.mobile ? cleanText(b.mobile) : undefined,
      category: b.category,
      message: cleanText(b.message),
      ipHash: hashIp(req.ip),
    });
    res.status(201).json({ message: 'Thank you! We will reach out to you shortly.' });
  }),
);

export default router;
