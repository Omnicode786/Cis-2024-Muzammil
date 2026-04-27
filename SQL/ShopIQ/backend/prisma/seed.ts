import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password.js";

const prisma = new PrismaClient();

async function seedShop(params: {
  shopName: string;
  shopCode: string;
  shopEmail: string;
  ownerName: string;
  ownerEmail: string;
  cashierEmail: string;
}) {
  const passwordHash = await hashPassword("Demo@12345");

  const shop = await prisma.shop.create({
    data: {
      shopName: params.shopName,
      shopCode: params.shopCode,
      email: params.shopEmail,
      phoneNumber: "03001234567",
      address: "Demo Market, Karachi",
      users: {
        create: [
          {
            fullName: params.ownerName,
            email: params.ownerEmail,
            passwordHash,
            userType: "ADMIN",
            isPrimaryContact: true
          },
          {
            fullName: "Cashier Demo",
            email: params.cashierEmail,
            passwordHash,
            userType: "STAFF",
            staffDesignation: "CASHIER"
          }
        ]
      }
    },
    include: { users: true }
  });

  const owner = shop.users.find((item) => item.userType === "ADMIN");
  const cashier = shop.users.find((item) => item.userType === "STAFF");
  if (!owner || !cashier) throw new Error("Failed to create demo users.");

  const [customerA, customerB, supplierA, supplierB] = await prisma.$transaction([
    prisma.customer.create({
      data: {
        shopId: shop.shopId,
        customerName: "Ali Traders",
        phoneNumber: "03001230001",
        area: "Clifton",
        address: "Street 1, Clifton",
        notes: "Regular monthly groceries",
        createdByShopUserId: owner.shopUserId
      }
    }),
    prisma.customer.create({
      data: {
        shopId: shop.shopId,
        customerName: "Hina Store",
        phoneNumber: "03001230002",
        area: "Gulshan",
        address: "Street 2, Gulshan",
        notes: "Electricity billing customer",
        createdByShopUserId: owner.shopUserId
      }
    }),
    prisma.supplier.create({
      data: {
        shopId: shop.shopId,
        supplierName: "Fresh Foods Wholesale",
        phoneNumber: "03005550001",
        paymentType: "CREDIT",
        creditDays: 30,
        notes: "Primary grocery supplier",
        createdByShopUserId: owner.shopUserId
      }
    }),
    prisma.supplier.create({
      data: {
        shopId: shop.shopId,
        supplierName: "City Power Services",
        phoneNumber: "03005550002",
        paymentType: "CASH",
        notes: "Utility service vendor",
        createdByShopUserId: owner.shopUserId
      }
    })
  ]);

  await prisma.customerBillingLog.createMany({
    data: [
      {
        shopId: shop.shopId,
        customerId: customerA.customerId,
        billingDate: new Date("2026-04-01"),
        billingCategory: "GROCERIES",
        description: "April groceries",
        amount: 24000,
        billingMonth: "2026-04",
        createdByShopUserId: owner.shopUserId
      },
      {
        shopId: shop.shopId,
        customerId: customerB.customerId,
        billingDate: new Date("2026-04-01"),
        billingCategory: "ELECTRICITY",
        description: "April electricity",
        amount: 13500,
        billingMonth: "2026-04",
        createdByShopUserId: cashier.shopUserId
      }
    ]
  });

  await prisma.paymentLog.createMany({
    data: [
      {
        shopId: shop.shopId,
        customerId: customerA.customerId,
        paymentDate: new Date("2026-04-08"),
        amountPaid: 12000,
        paymentMethod: "BANK",
        referenceNo: "B-APR-001",
        remarks: "Part payment",
        createdByShopUserId: cashier.shopUserId
      },
      {
        shopId: shop.shopId,
        customerId: customerB.customerId,
        paymentDate: new Date("2026-04-10"),
        amountPaid: 9000,
        paymentMethod: "CASH",
        remarks: "Counter collection",
        createdByShopUserId: cashier.shopUserId
      }
    ]
  });

  await prisma.supplierTransactionLog.createMany({
    data: [
      {
        shopId: shop.shopId,
        supplierId: supplierA.supplierId,
        transactionDate: new Date("2026-04-03"),
        transactionType: "PURCHASE",
        amount: 32000,
        description: "April inventory lot",
        createdByShopUserId: owner.shopUserId
      },
      {
        shopId: shop.shopId,
        supplierId: supplierA.supplierId,
        transactionDate: new Date("2026-04-12"),
        transactionType: "PAYMENT",
        amount: 15000,
        description: "Part settlement",
        createdByShopUserId: owner.shopUserId
      },
      {
        shopId: shop.shopId,
        supplierId: supplierB.supplierId,
        transactionDate: new Date("2026-04-05"),
        transactionType: "PURCHASE",
        amount: 8500,
        description: "Utility service invoice",
        createdByShopUserId: owner.shopUserId
      }
    ]
  });

  const thread = await prisma.aiThread.create({
    data: {
      shopId: shop.shopId,
      createdByShopUserId: owner.shopUserId,
      title: "How is my shop doing?"
    }
  });

  await prisma.aiMessage.createMany({
    data: [
      {
        shopId: shop.shopId,
        aiThreadId: thread.aiThreadId,
        role: "USER",
        content: "How is my shop doing this month?",
        createdByShopUserId: owner.shopUserId
      },
      {
        shopId: shop.shopId,
        aiThreadId: thread.aiThreadId,
        role: "ASSISTANT",
        content:
          "## Snapshot\n\n- Billing is ahead of collections.\n- Supplier payables are present.\n- Customer receivables need follow-up.\n\n### Recommended next steps\n\n1. Follow up with Ali Traders.\n2. Clear part of Fresh Foods balance.\n3. Review the April collection plan.",
        modelName: "seeded-demo"
      }
    ]
  });
}

async function main() {
  await prisma.aiMessage.deleteMany();
  await prisma.aiThread.deleteMany();
  await prisma.refreshSession.deleteMany();
  await prisma.supplierTransactionLog.deleteMany();
  await prisma.paymentLog.deleteMany();
  await prisma.customerBillingLog.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.shopUser.deleteMany();
  await prisma.shop.deleteMany();

  await seedShop({
    shopName: "ShopIQ Demo Mart",
    shopCode: "SHOPIQ-DEMO-1",
    shopEmail: "shop1@shopiq.demo",
    ownerName: "Owner Demo",
    ownerEmail: "owner@shopiq.demo",
    cashierEmail: "cashier@shopiq.demo"
  });

  await seedShop({
    shopName: "ShopIQ Fresh Corner",
    shopCode: "SHOPIQ-DEMO-2",
    shopEmail: "shop2@shopiq.demo",
    ownerName: "Second Owner",
    ownerEmail: "owner2@shopiq.demo",
    cashierEmail: "cashier2@shopiq.demo"
  });

  console.log("Seed completed successfully.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
