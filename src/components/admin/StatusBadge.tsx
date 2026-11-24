const badgeVariantMap = {
  green: "admin-badge--green",
  blue: "admin-badge--blue",
  yellow: "admin-badge--yellow",
  red: "admin-badge--red",
  gray: "admin-badge--gray",
  orange: "admin-badge--orange",
} as const;

type StatusBadgeProps = {
  label: string;
  variant: keyof typeof badgeVariantMap;
};

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  return (
    <span className={`admin-badge ${badgeVariantMap[variant]}`}>{label}</span>
  );
}

export function contractStatusVariant(
  status: string
): keyof typeof badgeVariantMap {
  switch (status) {
    case "active":
      return "orange";
    case "pending":
      return "yellow";
    case "expired":
      return "gray";
    case "cancelled":
      return "red";
    default:
      return "gray";
  }
}

export function billingStatusVariant(
  status: string
): keyof typeof badgeVariantMap {
  switch (status) {
    case "paid":
      return "green";
    case "pending":
      return "yellow";
    case "unpaid":
      return "yellow";
    case "overdue":
      return "red";
    default:
      return "gray";
  }
}

export function publishStatusVariant(
  status: string
): keyof typeof badgeVariantMap {
  switch (status) {
    case "published":
      return "orange";
    case "draft":
      return "gray";
    case "suspended":
      return "red";
    default:
      return "gray";
  }
}
