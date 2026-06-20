"use client";

import { getBusinessTypeLabel } from "@/lib/admin/demo-labels";
import { displayOrEmpty, getTemplateLabelFromGenre } from "@/lib/admin/demo-url-import";
import type { DemoUrlImportResult } from "@/types/demo-url-import";

type DemoImportReviewPanelProps = {
  result: DemoUrlImportResult;
  importPhaseMessage?: string | null;
};

export function DemoImportReviewPanel({
  result,
  importPhaseMessage,
}: DemoImportReviewPanelProps) {
  const menuSummary =
    result.menus.length > 0
      ? result.menus
          .map((m) => {
            const price = m.price.trim() ? ` ${m.price}` : "（価格未取得）";
            return `${m.name}${price}`;
          })
          .join(" / ")
      : displayOrEmpty("");

  const stats = result.photoStats;
  const isLoadingPhotos =
    result.importPhase === "store" ||
    result.importPhase === "photos-initial" ||
    importPhaseMessage?.includes("取得中");

  return (
    <div className="admin-import-review">
      <h3 className="admin-import-review-title">取得した店舗情報</h3>
      <p className="admin-import-review-note">
        取得できた項目のみ表示しています。未取得の項目は空欄のまま保存され、公開デモではサンプル表示されます。
      </p>

      {result.fromCache ? (
        <p className="admin-import-cache-badge">キャッシュから読み込み（24時間以内）</p>
      ) : null}

      {importPhaseMessage ? (
        <p className="admin-import-phase-message">{importPhaseMessage}</p>
      ) : null}

      {stats.total > 0 ? (
        <div className="admin-photo-stats">
          {stats.tabelog > 0 ? (
            <span className="admin-photo-stats-item">食べログ：{stats.tabelog}枚</span>
          ) : null}
          {stats.instagram > 0 ? (
            <span className="admin-photo-stats-item">Instagram：{stats.instagram}枚</span>
          ) : null}
          {stats.official > 0 ? (
            <span className="admin-photo-stats-item">公式サイト：{stats.official}枚</span>
          ) : null}
          <span className="admin-photo-stats-total">
            合計 {stats.total}枚{isLoadingPhotos ? "（取得中…）" : "取得"}
          </span>
        </div>
      ) : importPhaseMessage ? (
        <p className="admin-import-phase-message">写真を取得しています…</p>
      ) : null}

      {result.fetchNotes.length > 0 ? (
        <ul className="admin-import-notes">
          {result.fetchNotes.map((note, i) => (
            <li key={`${note}-${i}`}>{note}</li>
          ))}
        </ul>
      ) : null}

      <dl className="admin-import-review-list">
        <ReviewRow label="店舗名" value={displayOrEmpty(result.storeName)} />
        <ReviewRow
          label="ジャンル"
          value={result.genre ? result.genre : displayOrEmpty("")}
        />
        <ReviewRow
          label="業態（推定）"
          value={getBusinessTypeLabel(result.businessType)}
        />
        <ReviewRow
          label="テンプレート（自動）"
          value={
            result.genre
              ? getTemplateLabelFromGenre(result.genre)
              : displayOrEmpty("")
          }
        />
        <ReviewRow label="住所" value={displayOrEmpty(result.address)} />
        <ReviewRow label="電話番号" value={displayOrEmpty(result.phone)} />
        <ReviewRow label="営業時間" value={displayOrEmpty(result.businessHours)} />
        <ReviewRow label="定休日" value={displayOrEmpty(result.closedDays)} />
        <ReviewRow label="アクセス" value={displayOrEmpty(result.access)} />
        <ReviewRow label="予算" value={displayOrEmpty(result.budget)} />
        <ReviewRow label="席数" value={displayOrEmpty(result.seats)} />
        <ReviewRow label="支払い方法" value={displayOrEmpty(result.paymentMethods)} />
        <ReviewRow label="禁煙・喫煙" value={displayOrEmpty(result.smokingPolicy)} />
        <ReviewRow label="駐車場" value={displayOrEmpty(result.parking)} />
        <ReviewRow label="Instagram" value={displayOrEmpty(result.instagramUrl)} />
        <ReviewRow label="公式サイト" value={displayOrEmpty(result.officialUrl)} />
        <ReviewRow label="予約URL" value={displayOrEmpty(result.reservationUrl)} />
        <ReviewRow label="メニュー" value={menuSummary} />
        <ReviewRow
          label="写真"
          value={
            stats.total > 0
              ? `合計 ${stats.total}枚（食べログ ${stats.tabelog} / Instagram ${stats.instagram} / 公式 ${stats.official}）`
              : displayOrEmpty("")
          }
        />
      </dl>
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  const isEmpty = value.startsWith("（未取得");
  return (
    <div className="admin-import-review-row">
      <dt>{label}</dt>
      <dd className={isEmpty ? "admin-import-review-empty" : undefined}>{value}</dd>
    </div>
  );
}
