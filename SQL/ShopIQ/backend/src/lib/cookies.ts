import crypto from "node:crypto";
import type { Response } from "express";
import { env, isProduction } from "../config/env.js";

const ACCESS_COOKIE_NAME = "shopiq_access";
const REFRESH_COOKIE_NAME = "shopiq_refresh";
const CSRF_COOKIE_NAME = "shopiq_csrf";

const baseCookie = {
  sameSite: "lax" as const,
  secure: isProduction || env.COOKIE_SECURE,
  path: "/"
};

export function randomToken(size = 48) {
  return crypto.randomBytes(size).toString("base64url");
}

export function hashOpaqueToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_COOKIE_NAME, accessToken, {
    ...baseCookie,
    httpOnly: true,
    maxAge: env.ACCESS_TOKEN_TTL_MINUTES * 60 * 1000
  });

  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...baseCookie,
    httpOnly: true,
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  });
}

export function setCsrfCookie(res: Response, csrfToken: string) {
  res.cookie(CSRF_COOKIE_NAME, csrfToken, {
    ...baseCookie,
    httpOnly: false,
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE_NAME, baseCookie);
  res.clearCookie(REFRESH_COOKIE_NAME, baseCookie);
  res.clearCookie(CSRF_COOKIE_NAME, baseCookie);
}

export const cookieNames = {
  access: ACCESS_COOKIE_NAME,
  refresh: REFRESH_COOKIE_NAME,
  csrf: CSRF_COOKIE_NAME
};
