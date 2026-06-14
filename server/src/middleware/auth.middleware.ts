import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from "../utils/jwt.utils";
import { ApiError } from "../utils/ApiError";
import { User } from "../models/user.model";
import { Role } from '../types';

/**
 * Extract token from Authorization header (Bearer) or `token` cookie.
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer '))
    return authHeader.slice(7);
  if (req.cookies?.token) return req.cookies.token;

  return null;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) throw ApiError.unauthorized("Unauthorized: No token provided");

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).lean();
    if (!user) throw ApiError.unauthorized("User no longer exists");

    if (user.deleted_at) throw ApiError.unauthorized("Account has been deleted");

    req.user = {
      _id: user._id,
      id: String(user._id),
      email: user.email,
      role: user.role,
      hotel: user.hotel ? String(user.hotel) : null,
      name: user.name,
    }

    next();

  } catch (err: any) {
    if (err instanceof ApiError) next(err);
    else next(ApiError.unauthorized('Invalid or expired token'));
  }
}

/**
 * Optional authentication - sets req.user if token is valid, otherwise continues.
 */
export async function optionalAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = extractToken(req);
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).lean();
    if (user && !user.deleted_at) {
      req.user = {
        _id: user._id,
        id: String(user._id),
        email: user.email,
        role: user.role,
        hotel: user.hotel ? String(user.hotel) : null,
        name: user.name,
      };
    }
  } catch {
    /* ignore - treat as anonymous */
  }
  next();
}


/**
 * Role-based access control. Pass allowed roles.
 *   authorize('admin')
 *   authorize('admin', 'owner')
 */

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(ApiError.unauthorized('You must be logged in.'));

    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action.'));
    }
    next();
  }
}