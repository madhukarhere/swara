import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { logger } from './lib/logger';
import { ensureStorage } from './lib/storage';

async function main(): Promise<void> {
  ensureStorage();
  await connectDB();
  const app = createApp();
  app.listen(env.PORT, () => {
    logger.info(`Swara API listening on http://localhost:${env.PORT} (${env.NODE_ENV})`);
    // eslint-disable-next-line no-console
    console.log(`\n  ➜  Swara API  http://localhost:${env.PORT}\n`);
  });
}

main().catch((err: unknown) => {
  const e = err as { message?: string; stack?: string };
  logger.error('Fatal startup error', { error: e?.message, stack: e?.stack });
  // eslint-disable-next-line no-console
  console.error('Fatal startup error:', e?.message);
  process.exit(1);
});
