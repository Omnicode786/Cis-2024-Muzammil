import { CreditCard } from "lucide-react";
import { AppShell } from "@/components/workspace/app-shell";
import { ComparativeBarsCard, DonutBreakdownCard, RankedBarsCard, StackedSignalCard } from "@/components/workspace/analytics-cards";
import { CrudManager } from "@/components/workspace/crud-manager";
import { MetricCard } from "@/components/workspace/metric-card";
import { ModuleHero, ModuleInsightPanel } from "@/components/workspace/module-hero";
import { SectionHeader } from "@/components/workspace/section-header";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { buildDailySeries, sumByGroup } from "@/lib/chart-helpers";
import { prisma } from "@/lib/prisma";
import { formatDate, toPlain } from "@/lib/utils";
import { workspaceHeading, workspaceNav, workspacePath } from "@/lib/workspace";

function money(value: any) {
  return `PKR ${Number(value || 0).toLocaleString()}`;
}

function compactMoney(value: number) {
  return `PKR ${Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0))}`;
}

export default async function Payments() {
  const user = await getCurrentUser();
  const [paymentsRaw, customersRaw, suppliersRaw, invoicesRaw, purchasesRaw] = await Promise.all([
    prisma.payment.findMany({ where: { shopId: user!.shopId }, include: { customer: true, supplier: true, invoice: true, purchase: true }, orderBy: { paidAt: "desc" }, take: 150 }),
    prisma.customer.findMany({ where: { shopId: user!.shopId }, orderBy: { name: "asc" } }),
    prisma.supplier.findMany({ where: { shopId: user!.shopId }, orderBy: { name: "asc" } }),
    prisma.invoice.findMany({ where: { shopId: user!.shopId, status: { not: "CANCELLED" } }, orderBy: { invoiceDate: "desc" }, take: 150 }),
    prisma.purchase.findMany({ where: { shopId: user!.shopId, status: { not: "CANCELLED" } }, orderBy: { purchaseDate: "desc" }, take: 150 })
  ]);
  const payments = toPlain(paymentsRaw).map((payment: any) => ({
    ...payment,
    partyName: payment.customer?.name || payment.supplier?.name || "General",
    referenceLabel: payment.invoice?.invoiceNo || payment.purchase?.purchaseNo || payment.reference || "-",
    amountDisplay: money(payment.amount),
    paidAtDisplay: formatDate(payment.paidAt)
  }));
  const customers = toPlain(customersRaw);
  const suppliers = toPlain(suppliersRaw);
  const invoices = toPlain(invoicesRaw);
  const purchases = toPlain(purchasesRaw);
  const incoming = payments.filter((payment: any) => payment.direction === "CUSTOMER_IN").reduce((sum: number, payment: any) => sum + Number(payment.amount), 0);
  const outgoing = payments.filter((payment: any) => payment.direction === "SUPPLIER_OUT").reduce((sum: number, payment: any) => sum + Number(payment.amount), 0);
  const cashflowTrend = buildDailySeries(
    payments,
    (payment: any) => payment.paidAt,
    (payment: any) => payment.direction === "CUSTOMER_IN" ? Number(payment.amount) : 0,
    14,
    (payment: any) => payment.direction === "SUPPLIER_OUT" ? Number(payment.amount) : 0
  );
  const methodMix = sumByGroup(payments, (payment: any) => payment.method?.replace(/_/g, " "), (payment: any) => Number(payment.amount), 7);
  const partyRank = sumByGroup(payments, (payment: any) => payment.partyName, (payment: any) => Number(payment.amount), 6);

  return (
    <AppShell nav={workspaceNav(user?.role)} heading={workspaceHeading(user?.role)} currentPath={workspacePath(user?.role, "payments")} user={user}>
      <SectionHeader eyebrow="Payments" title="Cashflow and settlement timeline" description="Track customer receipts, supplier payouts, payment modes and references with balance-safe edits." />
      <div className="module-command-grid">
        <ModuleHero
          eyebrow="Payments"
          title="Cashflow settlement rail"
          description="Record receipts and payouts with linked invoices, purchases, customers and suppliers, while protected balance reversals keep ledgers accurate."
          icon={CreditCard}
          badge="Cash movement"
          stats={[
            { label: "Incoming", value: money(incoming) },
            { label: "Outgoing", value: money(outgoing) },
            { label: "Records", value: payments.length }
          ]}
        />
        <ModuleInsightPanel
          title="Settlement checks"
          description="Search by party, method, reference or amount to audit cash movement without leaving the module."
          icon={CreditCard}
          insights={[
            { label: "Customer receipts", value: money(incoming) },
            { label: "Supplier payouts", value: money(outgoing) },
            { label: "Net movement", value: money(incoming - outgoing) }
          ]}
        />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <MetricCard icon={CreditCard} title="Incoming" value={money(incoming)} tone="emerald" />
        <MetricCard icon={CreditCard} title="Outgoing" value={money(outgoing)} tone="rose" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr_0.9fr]">
        <ComparativeBarsCard
          title="Settlement rhythm"
          description="Receipts and payouts in the same view, so cash movement is easy to read."
          data={cashflowTrend}
          valueLabel="Incoming"
          secondaryLabel="Outgoing"
          badge="14 days"
          format="money"
        />
        <DonutBreakdownCard
          title="Payment method mix"
          description="How money is moving through cash, bank, card and wallet channels."
          data={methodMix}
          centerValue={compactMoney(incoming + outgoing)}
          centerLabel="Moved"
          badge="Methods"
          format="money"
        />
        <StackedSignalCard
          title="Direction split"
          description="Customer receipts compared with supplier payouts."
          data={[
            { name: "Incoming", value: incoming },
            { name: "Outgoing", value: outgoing }
          ]}
          totalLabel={compactMoney(incoming - outgoing)}
          badge="Net"
        />
      </div>
      <div className="mt-6">
        <RankedBarsCard
          title="Party movement"
          description="Parties associated with the highest cash movement in this view."
          rows={partyRank}
          format="money"
          badge="Parties"
        />
      </div>
      <div className="mt-6">
        <CrudManager
          title="Payment records"
          description="Record receipts and payouts. Updates and deletes automatically reverse and reapply invoice, purchase and ledger effects."
          endpoint="/api/payments"
          rows={payments}
          fields={[
            { key: "direction", label: "Direction", type: "select", required: true, options: [{ label: "Customer in", value: "CUSTOMER_IN" }, { label: "Supplier out", value: "SUPPLIER_OUT" }] },
            { key: "method", label: "Method", type: "select", required: true, options: [{ label: "Cash", value: "CASH" }, { label: "Bank transfer", value: "BANK_TRANSFER" }, { label: "Card", value: "CARD" }, { label: "JazzCash", value: "JAZZCASH" }, { label: "EasyPaisa", value: "EASYPAISA" }, { label: "Cheque", value: "CHEQUE" }, { label: "Other", value: "OTHER" }] },
            { key: "amount", label: "Amount", type: "number", required: true },
            { key: "customerId", label: "Customer", type: "select", options: customers.map((customer: any) => ({ label: customer.name, value: customer.id })) },
            { key: "supplierId", label: "Supplier", type: "select", options: suppliers.map((supplier: any) => ({ label: supplier.name, value: supplier.id })) },
            { key: "invoiceId", label: "Invoice", type: "select", options: invoices.map((invoice: any) => ({ label: invoice.invoiceNo, value: invoice.id })) },
            { key: "purchaseId", label: "Purchase", type: "select", options: purchases.map((purchase: any) => ({ label: purchase.purchaseNo, value: purchase.id })) },
            { key: "reference", label: "Reference" },
            { key: "notes", label: "Notes", type: "textarea", span: "full" }
          ]}
          columns={[
            { key: "partyName", label: "Party" },
            { key: "direction", label: "Direction" },
            { key: "method", label: "Method" },
            { key: "referenceLabel", label: "Reference" },
            { key: "amountDisplay", label: "Amount" },
            { key: "paidAtDisplay", label: "Date" }
          ]}
          canCreate={can(user?.role, "payments", "create")}
          canUpdate={can(user?.role, "payments", "update")}
          canDelete={can(user?.role, "payments", "delete")}
          createLabel="Record payment"
        />
      </div>
    </AppShell>
  );
}
