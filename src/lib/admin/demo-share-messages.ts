import { buildShareUrl } from "@/lib/admin/app-url";

type ShareMessageInput = {
  prospectName: string;
  storeName: string;
  shareToken: string;
  contactPersonName?: string;
};

function recipientName(input: ShareMessageInput): string {
  const person = input.contactPersonName?.trim();
  if (person) return `${person}様`;
  const prospect = input.prospectName.trim();
  if (prospect && prospect !== "—") return `${prospect}様`;
  return `${input.storeName}様`;
}

export function buildShareSmsText(input: ShareMessageInput): string {
  const url = buildShareUrl(input.shareToken);
  const name = recipientName(input);
  return `${name}

先ほどお電話いたしましたSAKUPAGEです。
貴店向けに作成したHPサンプルを下記よりご確認いただけます。

${url}

お電話しながらご案内しますので、URLを開いてお待ちください。`;
}

export function buildShareEmailSubject(): string {
  return "貴店向けホームページサンプルのご案内";
}

export function buildShareEmailBody(input: ShareMessageInput): string {
  const url = buildShareUrl(input.shareToken);
  const name = recipientName(input);
  return `${name}

お世話になっております。
SAKUPAGEでございます。

貴店向けにホームページのサンプルを作成いたしました。
下記URLよりご確認いただけます。

${url}

掲載写真・文章・メニュー等は、ご利用開始前およびご利用開始後に変更可能です。

お電話にて画面をご覧いただきながらご案内いたしますので、よろしくお願いいたします。`;
}

export function formatShareViewStatus(summary: {
  viewCount: number;
  lastViewedAt: string | null;
}): string {
  if (summary.viewCount <= 0) return "未閲覧";
  if (summary.viewCount === 1) return "1回閲覧";
  if (summary.lastViewedAt) {
    return `最終閲覧：${formatShareDateTime(summary.lastViewedAt)}`;
  }
  return `${summary.viewCount}回閲覧`;
}

export function formatShareDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}/${m}/${day} ${h}:${min}`;
}

export function formatShareExpiry(
  expiresAt: string | null,
  isActive: boolean
): string {
  if (!isActive) return "無効";
  if (!expiresAt) return "無期限";
  const exp = new Date(expiresAt);
  if (exp.getTime() < Date.now()) return "期限切れ";
  return `${formatShareDateTime(expiresAt)} まで`;
}
