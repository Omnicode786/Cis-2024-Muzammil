import { useQuery } from "@tanstack/react-query";
import { PageCard } from "@/components/page-card";
import { api } from "@/lib/http";
import { money } from "@/lib/utils";

type ReportsData = {
  customerBalances: Array<{
    customer_id: string;
    customer_name: string;
    billed: string;
    paid: string;
    outstanding: string;
  }>;
  supplierBalances: Array<{
    supplier_id: string;
    supplier_name: string;
    purchases: string;
    payments: string;
    balance: string;
  }>;
};

export function ReportsPage() {
  const { data } = useQuery({
    queryKey: ["reports-summary"],
    queryFn: () => api.get<ReportsData>("/reports/summary")
  });

  return (
    <div className="page-stack">
      <PageCard title="Customer receivables report">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Customer</th><th>Billed</th><th>Paid</th><th>Outstanding</th></tr>
            </thead>
            <tbody>
              {data?.customerBalances.map((item) => (
                <tr key={item.customer_id}>
                  <td>{item.customer_name}</td>
                  <td>{money(item.billed)}</td>
                  <td>{money(item.paid)}</td>
                  <td>{money(item.outstanding)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>

      <PageCard title="Supplier payables report">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Supplier</th><th>Purchases</th><th>Payments</th><th>Balance</th></tr>
            </thead>
            <tbody>
              {data?.supplierBalances.map((item) => (
                <tr key={item.supplier_id}>
                  <td>{item.supplier_name}</td>
                  <td>{money(item.purchases)}</td>
                  <td>{money(item.payments)}</td>
                  <td>{money(item.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>
    </div>
  );
}
