import type { ActionItem } from "@/lib/admin/action-items";

type ActionRequiredProps = {
  items: ActionItem[];
};

export function ActionRequired({ items }: ActionRequiredProps) {
  if (items.length === 0) {
    return <span className="admin-action-none">—</span>;
  }

  return (
    <div className="admin-action-list">
      {items.map((item) => (
        <span key={item.label} className={`admin-action-item admin-action-item--${item.tone}`}>
          <span aria-hidden>{item.emoji}</span>
          {item.label}
        </span>
      ))}
    </div>
  );
}
