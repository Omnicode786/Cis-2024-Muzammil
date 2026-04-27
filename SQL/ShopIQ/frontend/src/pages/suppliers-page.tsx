import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageCard } from "@/components/page-card";
import { api } from "@/lib/http";

type Supplier = {
  supplierId: string;
  supplierName: string;
  paymentType: "CASH" | "CREDIT";
  creditDays: number | null;
  isActive: boolean;
};

export function SuppliersPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => api.get<Supplier[]>("/suppliers")
  });

  const createMutation = useMutation({
    mutationFn: (payload: unknown) => api.post("/suppliers", payload),
    onSuccess: () => {
      toast.success("Supplier created.");
      void queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (item: Supplier) => api.patch(`/suppliers/${item.supplierId}`, {
      isActive: !item.isActive,
      paymentType: item.paymentType,
      creditDays: item.creditDays
    }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["suppliers"] })
  });

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const paymentType = String(form.get("paymentType")) as "CASH" | "CREDIT";
    createMutation.mutate({
      supplierName: String(form.get("supplierName")),
      phoneNumber: String(form.get("phoneNumber")) || null,
      paymentType,
      creditDays: paymentType === "CREDIT" ? Number(form.get("creditDays")) : null,
      notes: String(form.get("notes")) || null
    });
    event.currentTarget.reset();
  };

  return (
    <div className="page-stack">
      <PageCard title="Suppliers" subtitle="Track cash and credit vendors with clean payables flow.">
        <form className="form-grid" onSubmit={handleCreate}>
          <input name="supplierName" className="field__input" placeholder="Supplier name" required />
          <input name="phoneNumber" className="field__input" placeholder="Phone number" />
          <select name="paymentType" className="field__input" required>
            <option value="CASH">Cash</option>
            <option value="CREDIT">Credit</option>
          </select>
          <input name="creditDays" className="field__input" type="number" placeholder="Credit days" />
          <input name="notes" className="field__input" placeholder="Notes" />
          <button className="primary-button" type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : "Add supplier"}
          </button>
        </form>
      </PageCard>

      <PageCard title="Supplier directory">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Payment type</th><th>Credit days</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {data?.map((item) => (
                <tr key={item.supplierId}>
                  <td>{item.supplierName}</td>
                  <td>{item.paymentType}</td>
                  <td>{item.creditDays ?? "—"}</td>
                  <td>{item.isActive ? "Active" : "Inactive"}</td>
                  <td>
                    <button type="button" className="ghost-button" onClick={() => toggleMutation.mutate(item)}>
                      {item.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>
    </div>
  );
}
