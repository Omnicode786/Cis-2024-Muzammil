import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageCard } from "@/components/page-card";
import { api } from "@/lib/http";

type Customer = {
  customerId: string;
  customerName: string;
  phoneNumber: string | null;
  area: string | null;
  isActive: boolean;
};

export function CustomersPage() {
  const queryClient = useQueryClient();
  const { data } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get<Customer[]>("/customers")
  });

  const createMutation = useMutation({
    mutationFn: (payload: unknown) => api.post("/customers", payload),
    onSuccess: () => {
      toast.success("Customer created.");
      void queryClient.invalidateQueries({ queryKey: ["customers"] });
    }
  });

  const toggleMutation = useMutation({
    mutationFn: (item: Customer) => api.patch(`/customers/${item.customerId}`, { isActive: !item.isActive }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["customers"] })
  });

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    createMutation.mutate({
      customerName: String(form.get("customerName")),
      phoneNumber: String(form.get("phoneNumber")) || null,
      area: String(form.get("area")) || null,
      address: String(form.get("address")) || null,
      notes: String(form.get("notes")) || null
    });
    event.currentTarget.reset();
  };

  return (
    <div className="page-stack">
      <PageCard title="Customers" subtitle="Maintain customer ledger profiles and activity anchors.">
        <form className="form-grid" onSubmit={handleCreate}>
          <input name="customerName" className="field__input" placeholder="Customer name" required />
          <input name="phoneNumber" className="field__input" placeholder="Phone number" />
          <input name="area" className="field__input" placeholder="Area" />
          <input name="address" className="field__input" placeholder="Address" />
          <input name="notes" className="field__input" placeholder="Notes" />
          <button className="primary-button" type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Saving..." : "Add customer"}
          </button>
        </form>
      </PageCard>

      <PageCard title="Customer directory">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr><th>Name</th><th>Phone</th><th>Area</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {data?.map((item) => (
                <tr key={item.customerId}>
                  <td>{item.customerName}</td>
                  <td>{item.phoneNumber ?? "—"}</td>
                  <td>{item.area ?? "—"}</td>
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
