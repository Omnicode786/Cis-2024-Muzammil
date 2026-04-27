import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageCard } from "@/components/page-card";
import { api } from "@/lib/http";
import { money, prettyDate } from "@/lib/utils";

type PaymentRow = {
  paymentId: string;
  paymentDate: string;
  amountPaid: string;
  paymentMethod: string;
  customer: { customerName: string };
};

type Customer = { customerId: string; customerName: string };

export function PaymentsPage() {
  const queryClient = useQueryClient();

  const { data: rows } = useQuery({
    queryKey: ["payments"],
    queryFn: () => api.get<PaymentRow[]>("/payments")
  });

  const { data: customers } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get<Customer[]>("/customers")
  });

  const createMutation = useMutation({
    mutationFn: (payload: unknown) => api.post("/payments", payload),
    onSuccess: () => {
      toast.success("Payment recorded.");
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
    }
  });

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createMutation.mutate({
      customerId: form.get("customerId"),
      paymentDate: String(form.get("paymentDate")),
      amountPaid: Number(form.get("amountPaid")),
      paymentMethod: String(form.get("paymentMethod")),
      referenceNo: String(form.get("referenceNo")) || null,
      remarks: String(form.get("remarks")) || null
    });
    event.currentTarget.reset();
  };

  return (
    <div className="page-stack">
      <PageCard title="Customer payments" subtitle="Track collections across cash, bank, wallet, and card.">
        <form className="form-grid" onSubmit={handleCreate}>
          <select name="customerId" className="field__input" required>
            <option value="">Select customer</option>
            {customers?.map((item) => (
              <option key={item.customerId} value={item.customerId}>{item.customerName}</option>
            ))}
          </select>
          <input name="paymentDate" type="date" className="field__input" required />
          <select name="paymentMethod" className="field__input" required>
            <option value="CASH">Cash</option>
            <option value="BANK">Bank</option>
            <option value="WALLET">Wallet</option>
            <option value="CARD">Card</option>
          </select>
          <input name="amountPaid" type="number" className="field__input" placeholder="Amount paid" required />
          <input name="referenceNo" className="field__input" placeholder="Reference no" />
          <input name="remarks" className="field__input" placeholder="Remarks" />
          <button className="primary-button" type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : "Record payment"}
          </button>
        </form>
      </PageCard>

      <PageCard title="Payment log">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Date</th><th>Customer</th><th>Method</th><th>Amount</th></tr>
            </thead>
            <tbody>
              {rows?.map((item) => (
                <tr key={item.paymentId}>
                  <td>{prettyDate(item.paymentDate)}</td>
                  <td>{item.customer.customerName}</td>
                  <td>{item.paymentMethod}</td>
                  <td>{money(item.amountPaid)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>
    </div>
  );
}
