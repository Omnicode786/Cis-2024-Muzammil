import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/http";
import { PageCard } from "@/components/page-card";

type StaffUser = {
  shopUserId: string;
  fullName: string;
  email: string;
  userType: "ADMIN" | "STAFF";
  staffDesignation: "MANAGER" | "CASHIER" | "OTHER" | null;
  isActive: boolean;
};

export function StaffPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data } = useQuery({
    queryKey: ["staff"],
    queryFn: () => api.get<StaffUser[]>("/staff")
  });

  const createMutation = useMutation({
    mutationFn: (payload: {
      fullName: string;
      email: string;
      password: string;
      userType: "ADMIN" | "STAFF";
      staffDesignation?: "MANAGER" | "CASHIER" | "OTHER" | null;
    }) => api.post("/staff", payload),
    onSuccess: () => {
      toast.success("User created.");
      void queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (error) => toast.error(error instanceof Error ? error.message : "Failed to create user.")
  });

  const toggleMutation = useMutation({
    mutationFn: (item: StaffUser) => api.patch(`/staff/${item.shopUserId}`, {
      isActive: !item.isActive,
      userType: item.userType,
      staffDesignation: item.staffDesignation
    }),
    onSuccess: () => {
      toast.success("User updated.");
      void queryClient.invalidateQueries({ queryKey: ["staff"] });
    }
  });

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const userType = String(form.get("userType")) as "ADMIN" | "STAFF";
    createMutation.mutate({
      fullName: String(form.get("fullName")),
      email: String(form.get("email")),
      password: String(form.get("password")),
      userType,
      staffDesignation: userType === "STAFF"
        ? (String(form.get("staffDesignation")) as "MANAGER" | "CASHIER" | "OTHER")
        : null
    });
    event.currentTarget.reset();
  };

  return (
    <div className="page-stack">
      <PageCard title="Team access" subtitle="Create admins and staff inside your current shop.">
        {user?.userType === "ADMIN" ? (
          <form className="form-grid" onSubmit={handleCreate}>
            <input name="fullName" className="field__input" placeholder="Full name" required />
            <input name="email" className="field__input" type="email" placeholder="Email" required />
            <input name="password" className="field__input" type="password" placeholder="Temporary password" required />
            <select name="userType" className="field__input" required>
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
            </select>
            <select name="staffDesignation" className="field__input">
              <option value="MANAGER">Manager</option>
              <option value="CASHIER">Cashier</option>
              <option value="OTHER">Other</option>
            </select>
            <button className="primary-button" type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Saving..." : "Create user"}
            </button>
          </form>
        ) : <p className="muted">Only admins can create and update team users.</p>}
      </PageCard>

      <PageCard title="Current users" subtitle="Users are isolated to this shop only.">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Type</th><th>Designation</th><th>Status</th>{user?.userType === "ADMIN" ? <th /> : null}
              </tr>
            </thead>
            <tbody>
              {data?.map((item) => (
                <tr key={item.shopUserId}>
                  <td>{item.fullName}</td>
                  <td>{item.email}</td>
                  <td>{item.userType}</td>
                  <td>{item.staffDesignation ?? "—"}</td>
                  <td>{item.isActive ? "Active" : "Inactive"}</td>
                  {user?.userType === "ADMIN" ? (
                    <td>
                      <button type="button" className="ghost-button" onClick={() => toggleMutation.mutate(item)}>
                        {item.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PageCard>
    </div>
  );
}
