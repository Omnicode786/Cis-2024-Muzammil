import {
  Bot,
  ChartNoAxesCombined,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Receipt,
  Store,
  Truck,
  Users
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "./theme-toggle";

const links = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/staff", label: "Staff", icon: Users },
  { to: "/customers", label: "Customers", icon: Users },
  { to: "/suppliers", label: "Suppliers", icon: Truck },
  { to: "/billing", label: "Billing", icon: Receipt },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/supplier-transactions", label: "Supplier Txns", icon: Store },
  { to: "/reports", label: "Reports", icon: ChartNoAxesCombined },
  { to: "/assistant", label: "AI Assistant", icon: Bot }
];

export function AppShell() {
  const { user, logout } = useAuth();

  return (
    <div className="app-layout">
      <aside className="sidebar panel">
        <div className="brand">
          <div className="brand__badge">SIQ</div>
          <div>
            <strong>ShopIQ</strong>
            <p>{user?.shopName}</p>
          </div>
        </div>

        <nav className="sidebar__nav">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => isActive ? "nav-link nav-link--active" : "nav-link"}>
                <Icon size={16} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar__footer">
          <div className="user-chip">
            <div>
              <strong>{user?.fullName}</strong>
              <p>{user?.userType}{user?.staffDesignation ? ` • ${user.staffDesignation}` : ""}</p>
            </div>
          </div>
          <ThemeToggle />
          <button type="button" className="ghost-button ghost-button--danger" onClick={() => void logout()}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
