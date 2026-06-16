import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';

interface Schemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Validate/parse request parts with zod. Parsed values are placed on `req.valid`
 * (we avoid reassigning the read-only `req.query` getter). Body is also written
 * back to `req.body` for convenience.
 */
export const validate =
  (schemas: Schemas) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const valid: { body?: unknown; query?: unknown; params?: unknown } = {};
      if (schemas.body) {
        valid.body = schemas.body.parse(req.body);
        req.body = valid.body;
      }
      if (schemas.query) valid.query = schemas.query.parse(req.query);
      if (schemas.params) valid.params = schemas.params.parse(req.params);
      req.valid = valid;
      next();
    } catch (err) {
      next(err);
    }
  };
