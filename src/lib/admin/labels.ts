import type { TemplateType } from "@/types/store";
import type {
  AdminPublishStatus,
  BillingStatus,
  ContractStatus,
} from "@/types/admin";

export const templateTypeLabels: Record<TemplateType, string> = {
  "luxury-izakaya": "高級和風居酒屋",
  cafe: "Cafe",
};

export const contractStatusLabels: Record<ContractStatus, string> = {
  active: "契約中",
  pending: "準備中",
  expired: "期限切れ",
  cancelled: "解約済",
};

export const billingStatusLabels: Record<BillingStatus, string> = {
  paid: "支払済",
  unpaid: "未払い",
  overdue: "延滞",
  pending: "請求前",
};

export const publishStatusLabels: Record<AdminPublishStatus, string> = {
  published: "公開中",
  draft: "下書き",
  suspended: "停止中",
};

export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString("ja-JP")}`;
}

export function formatDate(date: string): string {
  return date.replace(/-/g, "/");
}

export const paymentMethodLabels = {
  card: "クレジットカード",
  invoice: "請求書払い",
} as const;

export const cancellationNoticeLabels = {
  none: "未予約",
  scheduled: "予約済み",
  notified: "通知済み",
} as const;
