import { Router } from 'express';
import { createCaptcha } from '../../lib/captcha';

const router = Router();

/* GET /api/captcha — fresh local image CAPTCHA (svg + data URI + signed token). */
router.get('/', (_req, res) => {
  const { svg, token } = createCaptcha();
  res.json({
    token,
    svg,
    image: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`,
  });
});

export default router;
