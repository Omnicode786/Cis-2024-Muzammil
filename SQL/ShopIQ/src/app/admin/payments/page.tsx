import { CreditCard } from "lucide-react";
import { CrudManager } from "@/components/workspace/crud-manager";
import { MetricCard } from "@/components/workspace/metric-card";
import { ModuleHero, ModuleInsightPanel } from "@/components/workspace/module-hero";
import { SectionHeader } from "@/components/workspace/section-header";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { invoiceItemsSummary, isAutomaticInvoicePayment } from "@/lib/payment-workflow";
import { prisma } from "@/lib/prisma";
import { contains, dateRange, paginationMeta, readTableState, type TableSearchParams } from "@/lib/table-pagination";
import { formatDate, toPlain } from "@/lib/utils";

function money(value: any) {
  return `PKR ${Number(value || 0).toLocaleString()}`;
}

export default async function Payments({ searchParams }: { searchParams?: TableSearchParams }) {
  const user = await getCurrentUser();
  const table = readTableState(searchParams);
  const paymentFilters: any[] = [];
  
  if (table.query) {
    paymentFilters.push({
      OR: [
        { reference: contains(table.query) },
        { notes: contains(table.query) },
        { customer: { is: { name: contains(table.query) } } },
        { invoice: { is: { invoiceNo: contains(table.query) } } }
      ]
    });
  }
  if (table.facet) paymentFilters.push({ method: table.facet });
  const paymentDateRange = dateRange("paidAt", table.dateFrom, table.dateTo);
  if (paymentDateRange) paymentFilters.push(paymentDateRange);
  const paymentWhere = { shopId: user!.shopId, ...(paymentFilters.length ? { AND: paymentFilters } : {}) };
  
  const [paymentsRaw, paymentsTotal, incomingAgg, customersRaw, invoicesRaw] = await Promise.all([
    prisma.payment.findMany({ where: paymentWhere, include: { customer: true, invoice: { include: { customer: true } } }, orderBy: { paidAt: "desc" }, skip: table.skip, take: table.take }),
    prisma.payment.count({ where: paymentWhere }),
    prisma.payment.aggregate({ where: { shopId: user!.shopId }, _sum: { amount: true } }),
    prisma.customer.findMany({ where: { shopId: user!.shopId }, orderBy: { name: "asc" } }),
    prisma.invoice.findMany({
      where: { shopId: user!.shopId, status: { not: "CANCELLED" } },
      include: { customer: true, items: { include: { product: true } } },
      orderBy: { invoiceDate: "desc" },
      take: 150
    })
  ]);

  const payments = toPlain(paymentsRaw).map((payment: any) => ({
    ...payment,
    isAutomaticInvoicePayment: isAutomaticInvoicePayment(payment, payment.invoice?.invoiceNo),
    canManagePaymentRecord: !isAutomaticInvoicePayment(payment, payment.invoice?.invoiceNo),
    partyName: payment.customer?.name || payment.invoice?.customer?.name || "Walk-in",
    referenceLabel: payment.invoice?.invoiceNo || payment.reference || "-",
    amountDisplay: money(payment.amount),
    paidAtDisplay: formatDate(payment.paidAt)
  }));
  
  const customers = toPlain(customersRaw);
  const invoices = toPlain(invoicesRaw);
  const incoming = Number(incomingAgg._sum.amount || 0);

  const paymentFields = [
    { key: "direction", label: "Direction", type: "select" as const, required: true, defaultValue: "CUSTOMER_IN", options: [{ label: "Customer in", value: "CUSTOMER_IN" }], hideOnCreate: true, hideOnEdit: true },
    { key: "method", label: "Method", type: "select" as const, required: true, defaultValue: "CASH", options: [{ label: "Cash", value: "CASH" }, { label: "Bank transfer", value: "BANK_TRANSFER" }, { label: "Card", value: "CARD" }, { label: "JazzCash", value: "JAZZCASH" }, { label: "EasyPaisa", value: "EASYPAISA" }, { label: "Cheque", value: "CHEQUE" }, { label: "Other", value: "OTHER" }] },
    { key: "amount", label: "Amount", type: "number" as const, required: true },
    { key: "customerId", label: "Customer", type: "select" as const, options: customers.map((customer: any) => ({ label: customer.name, value: customer.id })) },
    {
      key: "invoiceId",
      label: "Invoice",
      type: "select" as const,
      options: invoices.map((invoice: any) => ({
        label: `${invoice.invoiceNo} - ${invoice.customer?.name || "Walk-in"} - due ${money(invoice.dueAmount)}`,
        value: invoice.id,
        meta: {
          invoiceNo: invoice.invoiceNo,
          customerId: invoice.customerId,
          customerName: invoice.customer?.name || "Walk-in",
          total: Number(invoice.total || 0),
          paidAmount: Number(invoice.paidAmount || 0),
          remainingBalance: Number(invoice.dueAmount || 0),
          status: invoice.status,
          itemsSummary: invoiceItemsSummary(invoice.items || [])
        }
      }))
    },
    { key: "reference", label: "Reference" },
    { key: "notes", label: "Notes", type: "textarea" as const, span: "full" as const }
  ];

  return (
    <>
      <SectionHeader eyebrow="Payments" title="Customer receipts timeline" description="Track customer receipts, payment modes and references with balance-safe edits." />
      <div className="module-command-grid">
        <ModuleHero
          eyebrow="Payments"
          title="Customer receipt rail"
          description="Record receipts linked to invoices and customers, while protected balance reversals keep ledgers accurate."
          icon={CreditCard}
          badge="Cash movement"
          stats={[
            { label: "Incoming", value: money(incoming) },
            { label: "Records", value: paymentsTotal }
          ]}
        />
        <ModuleInsightPanel
          title="Settlement checks"
          description="Search by customer, method, reference or amount to audit cash movement without leaving the module."
          icon={CreditCard}
          insights={[
            { label: "Customer receipts", value: money(incoming) }
          ]}
        />
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <MetricCard icon={CreditCard} title="Incoming" value={money(incoming)} tone="emerald" />
        <MetricCard icon={CreditCard} title="Total Records" value={paymentsTotal} tone="violet" />
      </div>
      <div className="mt-6">
        <CrudManager
          title="Payment records"
          description="Record customer receipts with invoice links."
          endpoint="/api/payments"
          rows={payments}
          pagination={paginationMeta(table, paymentsTotal)}
          filterConfig={{
            facetKey: "method",
            facetLabel: "Method",
            facetOptions: ["CASH", "BANK_TRANSFER", "CARD", "JAZZCASH", "EASYPAISA", "CHEQUE", "OTHER"],
            dateKey: "paidAt",
            dateLabel: "Paid date"
          }}
          fields={paymentFields}
          columns={[
            { key: "partyName", label: "Customer" },
            { key: "method", label: "Method" },
            { key: "referenceLabel", label: "Reference" },
            { key: "amountDisplay", label: "Amount" },
            { key: "paidAtDisplay", label: "Date" }
          ]}
          canCreate={can(user?.role, "payments", "create")}
          canUpdate={can(user?.role, "payments", "update")}
          canDelete={can(user?.role, "payments", "delete")}
          canUpdateRowKey="canManagePaymentRecord"
          canDeleteRowKey="canManagePaymentRecord"
          createLabel="Record payment"
        />
      </div>
    </>
  );
}
