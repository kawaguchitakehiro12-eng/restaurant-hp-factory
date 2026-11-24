import type { StoreSubscription } from "@/types/admin";
import { daysUntil } from "@/lib/admin/helpers";

export type ActionItem = {
  emoji: string;
  label: string;
  tone: "orange" | "red" | "yellow" | "blue";
};

export function getActionItems(sub: StoreSubscription): ActionItem[] {
  const items: ActionItem[] = [];
  const daysLeft = daysUntil(sub.minimumTermEndDate);

  if (sub.cancellationNoticeStatus !== "none") {
    items.push({ emoji: "🟠", label: "解約通知予約", tone: "orange" });
  }
  if (
    sub.cancellationNoticeStatus !== "none" &&
    !sub.noticeEmailVerified
  ) {
    items.push({ emoji: "🔴", label: "メール未認証", tone: "red" });
  }
  if (daysLeft >= 0 && daysLeft <= 30) {
    items.push({ emoji: "🟡", label: "最低利用終了間近", tone: "yellow" });
  }
  if (sub.publishStatus === "draft") {
    items.push({ emoji: "🔵", label: "公開前", tone: "blue" });
  }
  if (sub.billingStatus === "unpaid" || sub.billingStatus === "overdue") {
    items.push({ emoji: "🔴", label: "未払い", tone: "red" });
  } else if (sub.billingStatus === "pending") {
    items.push({ emoji: "🔵", label: "請求前", tone: "blue" });
  }
  if (sub.suspensionScheduled) {
    items.push({ emoji: "🟠", label: "停止予約", tone: "orange" });
  }

  return items;
}

export function getBillingActionItems(sub: StoreSubscription): ActionItem[] {
  const items = getActionItems(sub);
  return items.filter(
    (item) =>
      item.label !== "公開前" ||
      sub.publishStatus === "draft"
  );
}
