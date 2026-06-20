"use client";

import { Pencil } from "lucide-react";
import { getBusinessTypeLabel } from "@/lib/admin/demo-labels";
import { displayOrEmpty } from "@/lib/admin/ai-demo-draft";
import type { AiDemoDraft } from "@/types/ai-demo-draft";
import { AI_PHOTO_CLASSIFICATION_LABELS } from "@/types/ai-demo-draft";

type AiDraftReviewPanelProps = {
  draft: AiDemoDraft;
  onConfirm: () => void;
  onEditManually: () => void;
  onRetry: () => void;
};

function ReviewRow({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  const isEmpty = value.startsWith("（未取得");
  return (
    <div className="admin-ai-review-row">
      <dt>{label}</dt>
      <dd className={isEmpty ? "admin-ai-review-empty" : undefined}>
        {value}
        {hint ? <span className="admin-ai-review-hint">{hint}</span> : null}
      </dd>
    </div>
  );
}

export function AiDraftReviewPanel({
  draft,
  onConfirm,
  onEditManually,
  onRetry,
}: AiDraftReviewPanelProps) {
  const menuSummary =
    draft.menus.length > 0
      ? draft.menus
          .map((m) => {
            const price = m.price.trim() ? ` ${m.price}` : "（価格未取得）";
            return `${m.name}${price}`;
          })
          .join(" / ")
      : "（未取得 — 公開時はサンプル表示）";

  const photoSummary =
    draft.classifiedPhotos.length > 0
      ? draft.classifiedPhotos
          .map((p) => `${AI_PHOTO_CLASSIFICATION_LABELS[p.classification]}（${p.source}）`)
          .join(" / ")
      : "（未取得 — 公開時はサンプル表示）";

  return (
    <div className="admin-ai-review">
      <h3 className="admin-ai-review-title">以下の内容でデモサイトを作成します</h3>
      <p className="admin-ai-review-note">
        未取得の項目は空欄のまま保存され、公開デモサイトではサンプル表示されます。
        各項目は次のステップで編集できます。
      </p>

      <dl className="admin-ai-review-list">
        <ReviewRow label="店舗名" value={displayOrEmpty(draft.storeName)} />
        <ReviewRow
          label="業態"
          value={
            draft.businessType
              ? getBusinessTypeLabel(draft.businessType)
              : displayOrEmpty("")
          }
        />
        <ReviewRow label="住所" value={displayOrEmpty(draft.address)} />
        <ReviewRow label="電話番号" value={displayOrEmpty(draft.phone)} />
        <ReviewRow label="営業時間" value={displayOrEmpty(draft.businessHours)} />
        <ReviewRow label="定休日" value={displayOrEmpty(draft.closedDays)} />
        <ReviewRow label="メニュー候補" value={menuSummary} />
        <ReviewRow label="写真分類結果" value={photoSummary} />
        <ReviewRow
          label="キャッチコピー"
          value={displayOrEmpty(draft.catchCopy)}
          hint={
            draft.generatedCopyFields.includes("catchCopy")
              ? "AI生成（取得情報ベース）"
              : undefined
          }
        />
        <ReviewRow
          label="コンセプト"
          value={displayOrEmpty(draft.concept)}
          hint={
            draft.generatedCopyFields.includes("concept")
              ? "AI生成（取得情報ベース）"
              : undefined
          }
        />
      </dl>

      <p className="admin-ai-edit-note">
        <Pencil size={13} strokeWidth={1.75} />
        内容は次のステップ「店舗情報」以降でいつでも編集できます
      </p>

      <div className="admin-ai-review-actions">
        <button type="button" className="admin-btn admin-btn--primary" onClick={onConfirm}>
          この内容でデモ作成
        </button>
        <button type="button" className="admin-btn admin-btn--secondary" onClick={onEditManually}>
          手動で修正してから作成
        </button>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={onRetry}>
          やり直す
        </button>
      </div>
    </div>
  );
}
