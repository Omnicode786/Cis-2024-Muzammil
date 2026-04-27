import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "./http";

export type CurrentUser = {
  shopUserId: string;
  shopId: string;
  email: string;
  fullName: string;
  userType: "ADMIN" | "STAFF";
  staffDesignation: "MANAGER" | "CASHIER" | "OTHER" | null;
  shopName: string;
};

type AuthContextValue = {
  user: CurrentUser | null;
  loading: boolean;
  refreshMe: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: CurrentUser | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = async () => {
    try {
      const response = await api.get<CurrentUser>("/auth/me");
      setUser(response);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  useEffect(() => {
    void refreshMe();
  }, []);

  const value = useMemo(() => ({ user, loading, refreshMe, logout, setUser }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider.");
  return value;
}
