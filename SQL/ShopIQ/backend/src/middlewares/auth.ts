import type { NextFunction, Request, Response } from "express";
import { cookieNames } from "../lib/cookies.js";
import { verifyAccessToken } from "../lib/jwt.js";
import { HttpError } from "../lib/http-error.js";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        shopUserId: bigint;
        shopId: bigint;
        role: "ADMIN" | "STAFF";
      };
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const accessToken = req.cookies[cookieNames.access] as string | undefined;

  if (!accessToken) {
    return next(new HttpError(401, "Authentication required."));
  }

  try {
    const payload = verifyAccessToken(accessToken);
    req.auth = {
      shopUserId: BigInt(payload.shopUserId),
      shopId: BigInt(payload.shopId),
      role: payload.role
    };
    return next();
  } catch {
    return next(new HttpError(401, "Invalid or expired access token."));
  }
}
