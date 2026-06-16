import type { Request } from 'express';
import { AuditLog } from '../models';
import { auditLogger } from '../lib/logger';

export async function writeAudit(params: {
  req?: Request;
  action: string;
  entity: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}): Promise<void> {
  const admin = params.req?.admin;
  const ip = params.req?.ip;
  try {
    await AuditLog.create({
      admin: admin?.sub,
      adminUsername: admin?.username,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      ip,
      meta: params.meta,
    });
  } catch {
    /* never block a request because audit persistence failed */
  }
  auditLogger.info('audit', {
    admin: admin?.username,
    action: params.action,
    entity: params.entity,
    entityId: params.entityId,
    ip,
  });
}
