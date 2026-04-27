import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageCard } from "@/components/page-card";
import { api } from "@/lib/http";
import { money, prettyDate } from "@/lib/utils";

type BillingRow = {
  billingLogId: string;
  billingDate: string;
  billingCategory: string;
  amount: string;
  billingMonth: string;
  customer: { customerName: string };
};

type Customer = { customerId: string; customerName: string };

export function BillingPage() {
  const queryClient = useQueryClient();

  const { data: rows } = useQuery({
    queryKey: ["billing"],
    queryFn: () => api.get<BillingRow[]>("/billing")
  });

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get<Customer[]>("/customers")
  });

  const createMutation = useMutation({
    mutationFn: (payload: unknown) => api.post("/billing", payload),
    onSuccess: () => {
      toast.success("Billing entry recorded.");
      void queryClient.invalidateQueries({ queryKey: ["billing"] });
    }
  });

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createMutation.mutate({
      customerId: form.get("customerId"),
      billingDate: String(form.get("billingDate")),
      billingCategory: String(form.get("billingCategory")),
      amount: Number(form.get("amount")),
      billingMonth: String(form.get("billingMonth")),
      description: String(form.get("description")) || null
    });
    event.currentTarget.reset();
  };

  return (
    <div className="page-stack">
      <PageCard title="Customer billing" subtitle="Post groceries, electricity, and other recurring bills.">
        <form className="form-grid" onSubmit={handleCreate}>
          <select name="customerId" className="field__input" required>
            <option value="">Select customer</option>
            {customers?.map((item) => (
              <option key={item.customerId} value={item.customerId}>{item.customerName}</option>
            ))}
          </select>
          <input name="billingDate" type="date" className="field__input" required />
          <select name="billingCategory" className="field__input" required>
            <option value="GROCERIES">Groceries</option>
            <option value="ELECTRICITY">Electricity</option>
            <option value="OTHER">Other</option>
          </select>
          <input name="billingMonth" className="field__input" placeholder="YYYY-MM" required />
          <input name="amount" type="number" className="field__input" placeholder="Amount" required />
          <input name="description" className="field__input" placeholder="Description" />
          <button className="primary-button" type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : "Add billing"}
          </button>
        </form>
      </PageCard>

      <PageCard title="Billing log">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Customer</th><th>Category</th><th>Month</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {rows?.map((item) => (
                <tr key={item.billingLogId}>
                  <td>{prettyDate(item.billingDate)}</td>
                  <td>{item.customer.customerName}</td>
                  <td>{item.billingCategory}</td>
                  <td>{item.billingMonth}</td>
                  <td>{money(item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>
    </div>
  );
}
