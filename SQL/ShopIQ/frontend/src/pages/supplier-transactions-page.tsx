import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageCard } from "@/components/page-card";
import { api } from "@/lib/http";
import { money, prettyDate } from "@/lib/utils";

type Row = {
  supplierTxnId: string;
  transactionDate: string;
  transactionType: string;
  amount: string;
  supplier: { supplierName: string };
};

type Supplier = { supplierId: string; supplierName: string };

export function SupplierTransactionsPage() {
  const queryClient = useQueryClient();

  const { data: rows } = useQuery({
    queryKey: ["supplier-transactions"],
    queryFn: () => api.get<Row[]>("/supplier-transactions")
  });

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => api.get<Supplier[]>("/suppliers")
  });

  const createMutation = useMutation({
    mutationFn: (payload: unknown) => api.post("/supplier-transactions", payload),
    onSuccess: () => {
      toast.success("Supplier transaction recorded.");
      void queryClient.invalidateQueries({ queryKey: ["supplier-transactions"] });
    }
  });

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createMutation.mutate({
      supplierId: form.get("supplierId"),
      transactionDate: String(form.get("transactionDate")),
      transactionType: String(form.get("transactionType")),
      amount: Number(form.get("amount")),
      description: String(form.get("description")) || null
    });
    event.currentTarget.reset();
  };

  return (
    <div className="page-stack">
      <PageCard title="Supplier transactions" subtitle="Record purchases, payments, returns, bonuses, and adjustments.">
        <form className="form-grid" onSubmit={handleCreate}>
          <select name="supplierId" className="field__input" required>
            <option value="">Select supplier</option>
            {suppliers?.map((item) => (
              <option key={item.supplierId} value={item.supplierId}>{item.supplierName}</option>
            ))}
          </select>
          <input name="transactionDate" type="date" className="field__input" required />
          <select name="transactionType" className="field__input" required>
            <option value="PURCHASE">Purchase</option>
            <option value="PAYMENT">Payment</option>
            <option value="ADJUSTMENT">Adjustment</option>
            <option value="BONUS">Bonus</option>
            <option value="RETURN">Return</option>
          </select>
          <input name="amount" type="number" className="field__input" placeholder="Amount" required />
          <input name="description" className="field__input" placeholder="Description" />
          <button className="primary-button" type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : "Add transaction"}
          </button>
        </form>
      </PageCard>

      <PageCard title="Supplier transaction log">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Supplier</th><th>Type</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {rows?.map((item) => (
                <tr key={item.supplierTxnId}>
                  <td>{prettyDate(item.transactionDate)}</td>
                  <td>{item.supplier.supplierName}</td>
                  <td>{item.transactionType}</td>
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
