import { money } from "@/lib/utils";

export function StatCard({ label, value, moneyMode = false }: { label: string; value: string | number; moneyMode?: boolean }) {
  return (
    <div className="stat-card">
      <span className="stat-card__label">{label}</span>
      <strong className="stat-card__value">{moneyMode ? money(value) : value}</strong>
    </div>
  );
}
