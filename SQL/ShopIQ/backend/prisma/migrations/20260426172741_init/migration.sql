/*
  Warnings:

  - The `auth_provider` column on the `shop_user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `staff_designation` column on the `shop_user` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `payment_type` column on the `supplier` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `role` on the `ai_message` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `billing_category` on the `customer_billing_log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `payment_method` on the `payment_log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `user_type` on the `shop_user` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `transaction_type` on the `supplier_transaction_log` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('password', 'otp', 'google');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ADMIN', 'STAFF');

-- CreateEnum
CREATE TYPE "StaffDesignation" AS ENUM ('MANAGER', 'CASHIER', 'OTHER');

-- CreateEnum
CREATE TYPE "SupplierPaymentType" AS ENUM ('CASH', 'CREDIT');

-- CreateEnum
CREATE TYPE "BillingCategory" AS ENUM ('GROCERIES', 'ELECTRICITY', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'BANK', 'WALLET', 'CARD');

-- CreateEnum
CREATE TYPE "SupplierTransactionType" AS ENUM ('PURCHASE', 'PAYMENT', 'ADJUSTMENT', 'BONUS', 'RETURN');

-- CreateEnum
CREATE TYPE "AiMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- DropForeignKey
ALTER TABLE "ai_message" DROP CONSTRAINT "fk_ai_message_creator";

-- DropForeignKey
ALTER TABLE "ai_message" DROP CONSTRAINT "fk_ai_message_shop";

-- DropForeignKey
ALTER TABLE "ai_message" DROP CONSTRAINT "fk_ai_message_thread";

-- DropForeignKey
ALTER TABLE "ai_thread" DROP CONSTRAINT "fk_ai_thread_creator";

-- DropForeignKey
ALTER TABLE "ai_thread" DROP CONSTRAINT "fk_ai_thread_shop";

-- DropForeignKey
ALTER TABLE "customer" DROP CONSTRAINT "fk_customer_creator_shop_user";

-- DropForeignKey
ALTER TABLE "customer" DROP CONSTRAINT "fk_customer_shop";

-- DropForeignKey
ALTER TABLE "customer_billing_log" DROP CONSTRAINT "fk_billing_creator_shop_user";

-- DropForeignKey
ALTER TABLE "customer_billing_log" DROP CONSTRAINT "fk_billing_customer";

-- DropForeignKey
ALTER TABLE "customer_billing_log" DROP CONSTRAINT "fk_billing_shop";

-- DropForeignKey
ALTER TABLE "payment_log" DROP CONSTRAINT "fk_payment_creator_shop_user";

-- DropForeignKey
ALTER TABLE "payment_log" DROP CONSTRAINT "fk_payment_customer";

-- DropForeignKey
ALTER TABLE "payment_log" DROP CONSTRAINT "fk_payment_shop";

-- DropForeignKey
ALTER TABLE "refresh_session" DROP CONSTRAINT "fk_refresh_session_shop";

-- DropForeignKey
ALTER TABLE "refresh_session" DROP CONSTRAINT "fk_refresh_session_user";

-- DropForeignKey
ALTER TABLE "shop_user" DROP CONSTRAINT "fk_shop_user_shop";

-- DropForeignKey
ALTER TABLE "supplier" DROP CONSTRAINT "fk_supplier_creator_shop_user";

-- DropForeignKey
ALTER TABLE "supplier" DROP CONSTRAINT "fk_supplier_shop";

-- DropForeignKey
ALTER TABLE "supplier_transaction_log" DROP CONSTRAINT "fk_supplier_txn_creator_shop_user";

-- DropForeignKey
ALTER TABLE "supplier_transaction_log" DROP CONSTRAINT "fk_supplier_txn_shop";

-- DropForeignKey
ALTER TABLE "supplier_transaction_log" DROP CONSTRAINT "fk_supplier_txn_supplier";

-- AlterTable
ALTER TABLE "ai_message" DROP COLUMN "role",
ADD COLUMN     "role" "AiMessageRole" NOT NULL;

-- AlterTable
ALTER TABLE "ai_thread" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "customer" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "customer_billing_log" DROP COLUMN "billing_category",
ADD COLUMN     "billing_category" "BillingCategory" NOT NULL;

-- AlterTable
ALTER TABLE "payment_log" DROP COLUMN "payment_method",
ADD COLUMN     "payment_method" "PaymentMethod" NOT NULL;

-- AlterTable
ALTER TABLE "shop" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "shop_user" DROP COLUMN "auth_provider",
ADD COLUMN     "auth_provider" "AuthProvider" NOT NULL DEFAULT 'password',
DROP COLUMN "user_type",
ADD COLUMN     "user_type" "UserType" NOT NULL,
DROP COLUMN "staff_designation",
ADD COLUMN     "staff_designation" "StaffDesignation",
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "supplier" DROP COLUMN "payment_type",
ADD COLUMN     "payment_type" "SupplierPaymentType" NOT NULL DEFAULT 'CASH',
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "supplier_transaction_log" DROP COLUMN "transaction_type",
ADD COLUMN     "transaction_type" "SupplierTransactionType" NOT NULL;

-- CreateIndex
CREATE INDEX "idx_billing_shop_category" ON "customer_billing_log"("shop_id", "billing_category");

-- CreateIndex
CREATE INDEX "idx_payment_shop_method" ON "payment_log"("shop_id", "payment_method");

-- CreateIndex
CREATE INDEX "idx_shop_user_shop_type" ON "shop_user"("shop_id", "user_type");

-- CreateIndex
CREATE INDEX "idx_supplier_txn_shop_type" ON "supplier_transaction_log"("shop_id", "transaction_type");

-- AddForeignKey
ALTER TABLE "shop_user" ADD CONSTRAINT "shop_user_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shop"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shop"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_created_by_shop_user_id_shop_id_fkey" FOREIGN KEY ("created_by_shop_user_id", "shop_id") REFERENCES "shop_user"("shop_user_id", "shop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shop"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier" ADD CONSTRAINT "supplier_created_by_shop_user_id_shop_id_fkey" FOREIGN KEY ("created_by_shop_user_id", "shop_id") REFERENCES "shop_user"("shop_user_id", "shop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_billing_log" ADD CONSTRAINT "customer_billing_log_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shop"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_billing_log" ADD CONSTRAINT "customer_billing_log_customer_id_shop_id_fkey" FOREIGN KEY ("customer_id", "shop_id") REFERENCES "customer"("customer_id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_billing_log" ADD CONSTRAINT "customer_billing_log_created_by_shop_user_id_shop_id_fkey" FOREIGN KEY ("created_by_shop_user_id", "shop_id") REFERENCES "shop_user"("shop_user_id", "shop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_log" ADD CONSTRAINT "payment_log_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shop"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_log" ADD CONSTRAINT "payment_log_customer_id_shop_id_fkey" FOREIGN KEY ("customer_id", "shop_id") REFERENCES "customer"("customer_id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_log" ADD CONSTRAINT "payment_log_created_by_shop_user_id_shop_id_fkey" FOREIGN KEY ("created_by_shop_user_id", "shop_id") REFERENCES "shop_user"("shop_user_id", "shop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_transaction_log" ADD CONSTRAINT "supplier_transaction_log_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shop"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_transaction_log" ADD CONSTRAINT "supplier_transaction_log_supplier_id_shop_id_fkey" FOREIGN KEY ("supplier_id", "shop_id") REFERENCES "supplier"("supplier_id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_transaction_log" ADD CONSTRAINT "supplier_transaction_log_created_by_shop_user_id_shop_id_fkey" FOREIGN KEY ("created_by_shop_user_id", "shop_id") REFERENCES "shop_user"("shop_user_id", "shop_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_session" ADD CONSTRAINT "refresh_session_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shop"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_session" ADD CONSTRAINT "refresh_session_shop_user_id_shop_id_fkey" FOREIGN KEY ("shop_user_id", "shop_id") REFERENCES "shop_user"("shop_user_id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_thread" ADD CONSTRAINT "ai_thread_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shop"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_thread" ADD CONSTRAINT "ai_thread_created_by_shop_user_id_shop_id_fkey" FOREIGN KEY ("created_by_shop_user_id", "shop_id") REFERENCES "shop_user"("shop_user_id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_message" ADD CONSTRAINT "ai_message_shop_id_fkey" FOREIGN KEY ("shop_id") REFERENCES "shop"("shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_message" ADD CONSTRAINT "ai_message_ai_thread_id_shop_id_fkey" FOREIGN KEY ("ai_thread_id", "shop_id") REFERENCES "ai_thread"("ai_thread_id", "shop_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_message" ADD CONSTRAINT "ai_message_created_by_shop_user_id_shop_id_fkey" FOREIGN KEY ("created_by_shop_user_id", "shop_id") REFERENCES "shop_user"("shop_user_id", "shop_id") ON DELETE SET NULL ON UPDATE CASCADE;
