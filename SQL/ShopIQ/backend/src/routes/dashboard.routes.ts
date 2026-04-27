import { Router } from "express";
import { Prisma } from "@prisma/client";
import { asyncHandler } from "../lib/async-handler.js";
import { serializeBigInts } from "../lib/serialize.js";
import { prisma } from "../lib/prisma.js";

export const dashboardRouter = Router();

dashboardRouter.get("/", asyncHandler(async (req, res) => {
  const shopId = req.auth!.shopId;
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

  const [customers, suppliers, users, currentMonthBilling, currentMonthCollections, receivables, payables, recentActivity] =
    await Promise.all([
      prisma.customer.count({ where: { shopId, isActive: true } }),
      prisma.supplier.count({ where: { shopId, isActive: true } }),
      prisma.shopUser.count({ where: { shopId, isActive: true } }),
      prisma.customerBillingLog.aggregate({
        where: { shopId, createdAt: { gte: monthStart } },
        _sum: { amount: true }
      }),
      prisma.paymentLog.aggregate({
        where: { shopId, createdAt: { gte: monthStart } },
        _sum: { amountPaid: true }
      }),
      prisma.$queryRaw<Array<{ total: Prisma.Decimal }>>`
        SELECT COALESCE(SUM(balance), 0) AS total
        FROM (
          SELECT c.customer_id,
                 COALESCE(SUM(b.amount), 0) - COALESCE(SUM(p.amount_paid), 0) AS balance
          FROM customer c
          LEFT JOIN customer_billing_log b ON b.customer_id = c.customer_id AND b.shop_id = c.shop_id
          LEFT JOIN payment_log p ON p.customer_id = c.customer_id AND p.shop_id = c.shop_id
          WHERE c.shop_id = ${shopId}
          GROUP BY c.customer_id
        ) balances
      `,
      prisma.$queryRaw<Array<{ total: Prisma.Decimal }>>`
        SELECT COALESCE(SUM(balance), 0) AS total
        FROM (
          SELECT s.supplier_id,
                 COALESCE(SUM(CASE WHEN t.transaction_type IN ('PURCHASE', 'ADJUSTMENT') THEN t.amount ELSE 0 END), 0)
                 -
                 COALESCE(SUM(CASE WHEN t.transaction_type IN ('PAYMENT', 'RETURN', 'BONUS') THEN t.amount ELSE 0 END), 0) AS balance
          FROM supplier s
          LEFT JOIN supplier_transaction_log t ON t.supplier_id = s.supplier_id AND t.shop_id = s.shop_id
          WHERE s.shop_id = ${shopId}
          GROUP BY s.supplier_id
        ) balances
      `,
      prisma.aiThread.findMany({
        where: { shopId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: { aiThreadId: true, title: true, updatedAt: true }
      })
    ]);

  res.json({
    success: true,
    data: serializeBigInts({
      stats: {
        customers,
        suppliers,
        activeUsers: users,
        monthBilling: currentMonthBilling._sum.amount ?? 0,
        monthCollections: currentMonthCollections._sum.amountPaid ?? 0,
        totalReceivables: receivables[0]?.total ?? 0,
        totalPayables: payables[0]?.total ?? 0
      },
      recentThreads: recentActivity
    })
  });
}));
