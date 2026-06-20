import type { ReactNode } from "react";

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  emphasis?: 1 | 2 | 3 | 4;
};

export function StatCard({ label, value, hint, emphasis }: StatCardProps) {
  const level = emphasis ? `admin-stat-card--e${emphasis}` : "";
  return (
    <div className={`admin-stat-card ${level}`.trim()}>
      <p className="admin-stat-label">{label}</p>
      <p className="admin-stat-value">{value}</p>
      {hint && <p className="admin-stat-hint">{hint}</p>}
    </div>
  );
}
