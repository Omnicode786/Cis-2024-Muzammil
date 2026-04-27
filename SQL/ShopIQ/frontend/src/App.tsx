import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/app-shell";
import { ProtectedRoute } from "@/components/protected-route";
import { LoginPage } from "@/pages/login-page";
import { RegisterShopPage } from "@/pages/register-shop-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { StaffPage } from "@/pages/staff-page";
import { CustomersPage } from "@/pages/customers-page";
import { SuppliersPage } from "@/pages/suppliers-page";
import { BillingPage } from "@/pages/billing-page";
import { PaymentsPage } from "@/pages/payments-page";
import { SupplierTransactionsPage } from "@/pages/supplier-transactions-page";
import { ReportsPage } from "@/pages/reports-page";
import { AssistantPage } from "@/pages/assistant-page";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterShopPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/suppliers" element={<SuppliersPage />} />
          <Route path="/billing" element={<BillingPage />} />
          <Route path="/payments" element={<PaymentsPage />} />
          <Route path="/supplier-transactions" element={<SupplierTransactionsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/assistant" element={<AssistantPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
