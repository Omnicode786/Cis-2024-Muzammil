import { Sparkles, SunMedium } from "lucide-react";
import { useThemeMode } from "@/lib/theme-context";

export function ThemeToggle() {
  const { mode, toggleMode } = useThemeMode();

  return (
    <button type="button" className="ghost-button" onClick={toggleMode}>
      {mode === "classic" ? <Sparkles size={16} /> : <SunMedium size={16} />}
      <span>{mode === "classic" ? "Liquid Glass" : "Classic"}</span>
    </button>
  );
}
