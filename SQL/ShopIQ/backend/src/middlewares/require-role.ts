import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/http-error.js";

export function requireRole(roles: Array<"ADMIN" | "STAFF">) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) {
      return next(new HttpError(401, "Authentication required."));
    }

    if (!roles.includes(req.auth.role)) {
      return next(new HttpError(403, "You do not have permission to perform this action."));
    }

    return next();
  };
}
