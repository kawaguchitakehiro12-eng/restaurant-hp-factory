"use client";

import Link from "next/link";
import { useState } from "react";
import { Mail } from "lucide-react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { getCancellationNoticeDate } from "@/lib/admin/cancellation";
import { formatDate } from "@/lib/admin/labels";
import { isWithinMinimumTerm } from "@/lib/admin/helpers";
import type { StoreSubscription } from "@/types/admin";

type NoticeFlow = "none" | "pending_verification" | "scheduled";

type BillingContractPanelProps = {
  subscription: StoreSubscription;
  contactEmail: string;
};

export function BillingContractPanel({
  subscription,
  contactEmail,
}: BillingContractPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState(contactEmail);
  const [flow, setFlow] = useState<NoticeFlow>(() => {
    if (subscription.cancellationNoticeStatus === "scheduled") {
      return subscription.noticeEmailVerified ? "scheduled" : "pending_verification";
    }
    if (subscription.cancellationNoticeStatus === "notified") return "scheduled";
    return "none";
  });

  const inMinimumTerm = isWithinMinimumTerm(subscription);
  const noticeDate =
    subscription.cancellationNoticeScheduledDate ??
    getCancellationNoticeDate(subscription.minimumTermEndDate);

  const handleSendConfirm = () => {
    setModalOpen(false);
    setFlow("pending_verification");
  };

  if (flow === "scheduled") {
    return (
      <div className="admin-card admin-contract-card">
        <div className="admin-contract-card-badge">
          <Mail size={16} strokeWidth={1.75} />
          解約通知予約済み
        </div>
        <dl className="admin-contract-card-meta">
          <div>
            <dt>通知予定日</dt>
            <dd>{formatDate(noticeDate)}</dd>
          </div>
        </dl>
        <div className="admin-contract-card-actions">
          <button type="button" className="admin-btn admin-btn--secondary text-xs">
            変更
          </button>
          <button type="button" className="admin-btn admin-btn--ghost text-xs">
            キャンセル
          </button>
        </div>
        <Link href="/dashboard" className="admin-contract-back">
          ← ダッシュボードに戻る
        </Link>
      </div>
    );
  }

  if (flow === "pending_verification") {
    return (
      <div className="admin-card admin-contract-card">
        <div className="admin-contract-card-badge admin-contract-card-badge--pending">
          <Mail size={16} strokeWidth={1.75} />
          確認メールを送信しました
        </div>
        <p className="admin-contract-card-text">
          {email} 宛に確認メールを送信しました。
          メール内のリンクから認証を完了してください。
        </p>
        <button
          type="button"
          className="admin-btn admin-btn--secondary text-xs"
          onClick={() => setFlow("scheduled")}
        >
          認証を完了した
        </button>
        <Link href="/dashboard" className="admin-contract-back">
          ← ダッシュボードに戻る
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="admin-card admin-contract-card">
        <h2 className="admin-contract-card-title">ご契約について</h2>
        {inMinimumTerm ? (
          <p className="admin-contract-card-text">
            現在ご契約期間中です。
            <br />
            解約可能日の1ヶ月前に通知を受け取れます。
          </p>
        ) : (
          <p className="admin-contract-card-text">
            解約をご希望の場合は、解約通知を予約してください。
          </p>
        )}
        <button
          type="button"
          className="admin-btn admin-btn--secondary admin-contract-cta"
          onClick={() => setModalOpen(true)}
        >
          解約通知を予約する
        </button>
        <Link href="/dashboard" className="admin-contract-back">
          ← ダッシュボードに戻る
        </Link>
      </div>

      <ConfirmModal
        open={modalOpen}
        title="解約通知の予約"
        message=""
        confirmLabel="確認メールを送信"
        onConfirm={handleSendConfirm}
        onCancel={() => setModalOpen(false)}
      >
        <div className="admin-modal-form">
          <label className="admin-form-label" htmlFor="notice-email">
            メールアドレス
          </label>
          <input
            id="notice-email"
            type="email"
            className="admin-form-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <p className="admin-modal-note">
            入力いただいたメールアドレス宛に予約受付確認メールを送信します。
            必ず受信確認をお願いいたします。
          </p>
          <p className="admin-modal-warning">
            ※確認メール未認証の場合、予約は完了になりません。
          </p>
        </div>
      </ConfirmModal>
    </>
  );
}
