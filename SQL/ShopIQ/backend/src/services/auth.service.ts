import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import { hashPassword, verifyPassword } from "../lib/password.js";
import { signAccessToken } from "../lib/jwt.js";
import {
  clearAuthCookies,
  cookieNames,
  hashOpaqueToken,
  randomToken,
  setAuthCookies,
  setCsrfCookie
} from "../lib/cookies.js";
import { env } from "../config/env.js";

type AuthUser = {
  shopUserId: bigint;
  shopId: bigint;
  email: string;
  fullName: string;
  userType: "ADMIN" | "STAFF";
  staffDesignation: "MANAGER" | "CASHIER" | "OTHER" | null;
  shopName: string;
};

function getClientMeta(req: Request) {
  return {
    userAgent: req.headers["user-agent"] ?? null,
    ipAddress: req.ip
  };
}

function toAccessPayload(user: AuthUser) {
  return {
    sub: String(user.shopUserId),
    shopUserId: String(user.shopUserId),
    shopId: String(user.shopId),
    role: user.userType
  } as const;
}

async function issueRefreshSession(user: AuthUser, req: Request) {
  const rawRefreshToken = randomToken(48);
  const tokenHash = hashOpaqueToken(rawRefreshToken);
  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshSession.create({
    data: {
      shopId: user.shopId,
      shopUserId: user.shopUserId,
      tokenHash,
      expiresAt,
      ...getClientMeta(req)
    }
  });

  return rawRefreshToken;
}

function attachSessionCookies(res: Response, accessToken: string, refreshToken: string) {
  const csrfToken = randomToken(24);
  setAuthCookies(res, accessToken, refreshToken);
  setCsrfCookie(res, csrfToken);
}

function authUserShape(user: {
  shopUserId: bigint;
  shopId: bigint;
  email: string;
  fullName: string;
  userType: "ADMIN" | "STAFF";
  staffDesignation: "MANAGER" | "CASHIER" | "OTHER" | null;
  shop: { shopName: string };
}) {
  return {
    shopUserId: user.shopUserId,
    shopId: user.shopId,
    email: user.email,
    fullName: user.fullName,
    userType: user.userType,
    staffDesignation: user.staffDesignation,
    shopName: user.shop.shopName
  };
}

export async function registerShop(body: {
  shopName: string;
  legalName?: string | null;
  shopCode: string;
  shopEmail?: string | null;
  shopPhoneNumber?: string | null;
  address?: string | null;
  adminFullName: string;
  adminEmail: string;
  adminPhoneNumber?: string | null;
  password: string;
}) {
  const existingUser = await prisma.shopUser.findUnique({
    where: { email: body.adminEmail }
  });

  if (existingUser) {
    throw new HttpError(409, "User already exists.");
  }

  const passwordHash = await hashPassword(body.password);

  const result = await prisma.$transaction(async (tx) => {
    const shop = await tx.shop.create({
      data: {
        shopName: body.shopName,
        legalName: body.legalName ?? null,
        shopCode: body.shopCode,
        email: body.shopEmail ?? null,
        phoneNumber: body.shopPhoneNumber ?? null,
        address: body.address ?? null
      }
    });

    const admin = await tx.shopUser.create({
      data: {
        shopId: shop.shopId,
        fullName: body.adminFullName,
        email: body.adminEmail,
        phoneNumber: body.adminPhoneNumber ?? null,
        passwordHash,
        userType: "ADMIN",
        staffDesignation: null,
        isPrimaryContact: true
      },
      include: {
        shop: {
          select: { shopName: true }
        }
      }
    });

    return authUserShape(admin);
  });

  return result;
}

export async function login(body: { email: string; password: string }) {
  const user = await prisma.shopUser.findUnique({
    where: { email: body.email },
    include: {
      shop: { select: { shopName: true, isActive: true } }
    }
  });

  if (!user || !user.passwordHash) {
    throw new HttpError(401, "Invalid email or password.");
  }

  if (!user.isActive || !user.shop.isActive) {
    throw new HttpError(403, "This account is inactive.");
  }

  const isValid = await verifyPassword(user.passwordHash, body.password);

  if (!isValid) {
    throw new HttpError(401, "Invalid email or password.");
  }

  await prisma.shopUser.update({
    where: { shopUserId: user.shopUserId },
    data: { lastLoginAt: new Date() }
  });

  return authUserShape(user);
}

export async function createSession(user: AuthUser, req: Request, res: Response) {
  const accessToken = signAccessToken(toAccessPayload(user));
  const refreshToken = await issueRefreshSession(user, req);
  attachSessionCookies(res, accessToken, refreshToken);
}

export async function rotateSession(req: Request, res: Response) {
  const rawRefreshToken = req.cookies[cookieNames.refresh] as string | undefined;
  if (!rawRefreshToken) {
    throw new HttpError(401, "Refresh token is missing.");
  }

  const tokenHash = hashOpaqueToken(rawRefreshToken);

  const session = await prisma.refreshSession.findUnique({
    where: { tokenHash },
    include: {
      shopUser: {
        include: {
          shop: { select: { shopName: true, isActive: true } }
        }
      }
    }
  });

  if (!session || session.revokedAt || session.expiresAt < new Date()) {
    throw new HttpError(401, "Refresh token is invalid or expired.");
  }

  if (!session.shopUser.isActive || !session.shopUser.shop.isActive) {
    throw new HttpError(403, "This account is inactive.");
  }

  const newRawToken = randomToken(48);
  const newTokenHash = hashOpaqueToken(newRawToken);
  const newExpiry = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.refreshSession.update({
      where: { refreshSessionId: session.refreshSessionId },
      data: { revokedAt: new Date(), lastUsedAt: new Date() }
    }),
    prisma.refreshSession.create({
      data: {
        shopId: session.shopId,
        shopUserId: session.shopUserId,
        tokenHash: newTokenHash,
        expiresAt: newExpiry,
        ...getClientMeta(req)
      }
    })
  ]);

  const authUser = {
    shopUserId: session.shopUser.shopUserId,
    shopId: session.shopUser.shopId,
    email: session.shopUser.email,
    fullName: session.shopUser.fullName,
    userType: session.shopUser.userType,
    staffDesignation: session.shopUser.staffDesignation,
    shopName: session.shopUser.shop.shopName
  } satisfies AuthUser;

  const accessToken = signAccessToken(toAccessPayload(authUser));
  attachSessionCookies(res, accessToken, newRawToken);

  return authUser;
}

export async function logout(req: Request, res: Response) {
  const rawRefreshToken = req.cookies[cookieNames.refresh] as string | undefined;

  if (rawRefreshToken) {
    const tokenHash = hashOpaqueToken(rawRefreshToken);
    await prisma.refreshSession.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() }
    });
  }

  clearAuthCookies(res);
}

export async function getCurrentUser(shopUserId: bigint) {
  const user = await prisma.shopUser.findUnique({
    where: { shopUserId },
    include: { shop: { select: { shopName: true } } }
  });

  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  return authUserShape(user);
}
