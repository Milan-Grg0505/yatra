import jwt, { SignOptions } from "jsonwebtoken";
import { Role } from "../types";
import { SingleKeyOptions } from "nodemailer/lib/dkim";
import { env } from "../config/env";

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: Role;
  hotel?: string | null;
}

export function signAccessToken(payload: JwtPayload): string {
  const opts: SignOptions = {
    expiresIn: env.JWT_EXPIRY as SignOptions['expiresIn']
  };

  return jwt.sign(payload, env.JWT_SECRET, opts);
}

export function signRefreshToken(payload: Pick<JwtPayload, 'sub'>): string {
  const opts: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRY as SignOptions['expiresIn']
  };

  return jwt.sign(payload, env.JWT_REFRESH_SECRET, opts);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}

export function verifyRefreshToken(token: string): { sub: string } {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sub: string };
}