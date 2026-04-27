import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { LoadingScreen } from "./loading-screen";

export function ProtectedRoute({ roles }: { roles?: Array<"ADMIN" | "STAFF"> }) {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.userType)) return <Navigate to="/" replace />;

  return <Outlet />;
}
