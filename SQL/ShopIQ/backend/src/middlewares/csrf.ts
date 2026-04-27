import type { NextFunction, Request, Response } from "express";
import { cookieNames } from "../lib/cookies.js";
import { HttpError } from "../lib/http-error.js";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);
const BYPASS_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/register-shop",
  "/api/auth/refresh"
]);

export function csrfProtection(req: Request, _res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method) || BYPASS_PATHS.has(req.path)) {
    return next();
  }

  const cookieToken = req.cookies[cookieNames.csrf] as string | undefined;
  const headerToken = req.headers["x-csrf-token"];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new HttpError(403, "CSRF validation failed."));
  }

  return next();
}
