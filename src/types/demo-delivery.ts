export type DemoDelivery = {
  id: string;
  channel: "sms" | "email";
  recipient: string;
  mode: "test" | "live";
  status: "processing" | "tested" | "accepted" | "failed" | "unknown";
  created_at: string;
};
export const DELIVERY_STATUS_LABELS: Record<DemoDelivery["status"], string> = {
  processing: "処理中・結果未確定（再送前に確認）", tested: "テスト完了（実送信なし）", accepted: "送信受付済み（到達未確認）", failed: "送信失敗", unknown: "結果不明（再送前に確認）",
};
