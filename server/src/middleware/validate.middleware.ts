import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type Source = 'body' | 'query' | 'params';

//This middleware is created to centralize and standardize request validation across your entire application. It's a powerful pattern that eliminates repetitive validation code.
export function validate(schema: ZodSchema, source: Source = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    // Mutate req[source] with parsed/transformed data
    (req as any)[source] = result.data;
    next();
  };
}
