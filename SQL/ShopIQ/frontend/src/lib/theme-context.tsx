import { createContext, useContext, useEffect, useMemo, useState } from "react";

type ThemeMode = "classic" | "liquid";

type ThemeContextValue = {
  mode: ThemeMode;
  toggleMode: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem("shopiq-theme-mode");
    return stored === "liquid" ? "liquid" : "classic";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem("shopiq-theme-mode", mode);
  }, [mode]);

  const value = useMemo(() => ({
    mode,
    toggleMode: () => setMode((prev) => (prev === "classic" ? "liquid" : "classic"))
  }), [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeMode() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useThemeMode must be used inside ThemeProvider.");
  return value;
}
