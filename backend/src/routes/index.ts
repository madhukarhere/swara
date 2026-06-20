import { Router } from 'express';
import { apiLimiter } from '../middleware/rateLimit';
import { requireAdmin } from '../middleware/auth';
import { requireCsrf } from '../middleware/csrf';

import publicSongs from './public/songs';
import publicCategories from './public/categories';
import publicCaptcha from './public/captcha';
import publicHomepage from './public/homepage';
import publicArticles from './public/articles';
import publicQuotes from './public/quotes';

import adminAuth from './admin/auth';
import adminSongs from './admin/songs';
import adminLyrics from './admin/lyrics';
import adminCategories from './admin/categories';
import adminComments from './admin/comments';
import adminEvents from './admin/events';
import adminArticles from './admin/articles';
import adminQuotes from './admin/quotes';
import adminAnnouncements from './admin/announcements';
import adminDashboard from './admin/dashboard';

export function buildApiRouter(): Router {
  const api = Router();
  api.use(apiLimiter);

  api.get('/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

  // ---- Public ----
  api.use('/songs', publicSongs);
  api.use('/categories', publicCategories);
  api.use('/captcha', publicCaptcha);
  api.use('/homepage', publicHomepage);
  api.use('/articles', publicArticles);
  api.use('/quotes', publicQuotes);

  // ---- Admin (CSRF on mutations; auth on everything except login/csrf) ----
  const admin = Router();
  admin.use(requireCsrf);
  admin.use('/', adminAuth);
  admin.use('/songs', requireAdmin, adminSongs);
  admin.use('/lyrics', requireAdmin, adminLyrics);
  admin.use('/categories', requireAdmin, adminCategories);
  admin.use('/comments', requireAdmin, adminComments);
  admin.use('/events', requireAdmin, adminEvents);
  admin.use('/articles', requireAdmin, adminArticles);
  admin.use('/quotes', requireAdmin, adminQuotes);
  admin.use('/announcements', requireAdmin, adminAnnouncements);
  admin.use('/dashboard', requireAdmin, adminDashboard);
  api.use('/admin', admin);

  return api;
}
