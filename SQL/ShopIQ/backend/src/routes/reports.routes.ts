import { Router } from "express";
import { Prisma } from "@prisma/client";
import { asyncHandler } from "../lib/async-handler.js";
import { prisma } from "../lib/prisma.js";
import { serializeBigInts } from "../lib/serialize.js";

export const reportsRouter = Router();

reportsRouter.get("/summary", asyncHandler(async (req, res) => {
  const shopId = req.auth!.shopId;

  const [customerBalances, supplierBalances] = await Promise.all([
    prisma.$queryRaw<Array<{ customer_id: bigint; customer_name: string; billed: Prisma.Decimal; paid: Prisma.Decimal; outstanding: Prisma.Decimal }>>`
      SELECT c.customer_id,
             c.customer_name,
             COALESCE(SUM(b.amount), 0) AS billed,
             COALESCE(SUM(p.amount_paid), 0) AS paid,
             COALESCE(SUM(b.amount), 0) - COALESCE(SUM(p.amount_paid), 0) AS outstanding
      FROM customer c
      LEFT JOIN customer_billing_log b ON b.customer_id = c.customer_id AND b.shop_id = c.shop_id
      LEFT JOIN payment_log p ON p.customer_id = c.customer_id AND p.shop_id = c.shop_id
      WHERE c.shop_id = ${shopId}
      GROUP BY c.customer_id, c.customer_name
      ORDER BY outstanding DESC
    `,
    prisma.$queryRaw<Array<{ supplier_id: bigint; supplier_name: string; purchases: Prisma.Decimal; payments: Prisma.Decimal; balance: Prisma.Decimal }>>`
      SELECT s.supplier_id,
             s.supplier_name,
             COALESCE(SUM(CASE WHEN t.transaction_type IN ('PURCHASE', 'ADJUSTMENT') THEN t.amount ELSE 0 END), 0) AS purchases,
             COALESCE(SUM(CASE WHEN t.transaction_type IN ('PAYMENT', 'RETURN', 'BONUS') THEN t.amount ELSE 0 END), 0) AS payments,
             COALESCE(SUM(CASE WHEN t.transaction_type IN ('PURCHASE', 'ADJUSTMENT') THEN t.amount ELSE 0 END), 0)
             -
             COALESCE(SUM(CASE WHEN t.transaction_type IN ('PAYMENT', 'RETURN', 'BONUS') THEN t.amount ELSE 0 END), 0) AS balance
      FROM supplier s
      LEFT JOIN supplier_transaction_log t ON t.supplier_id = s.supplier_id AND t.shop_id = s.shop_id
      WHERE s.shop_id = ${shopId}
      GROUP BY s.supplier_id, s.supplier_name
      ORDER BY balance DESC
    `
  ]);

  res.json({
    success: true,
    data: serializeBigInts({
      customerBalances: customerBalances.map((row) => ({
        ...row,
        billed: row.billed.toString(),
        paid: row.paid.toString(),
        outstanding: row.outstanding.toString()
      })),
      supplierBalances: supplierBalances.map((row) => ({
        ...row,
        purchases: row.purchases.toString(),
        payments: row.payments.toString(),
        balance: row.balance.toString()
      }))
    })
  });
}));
