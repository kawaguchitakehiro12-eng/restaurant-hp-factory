"use client";

import { Copy, ExternalLink, QrCode, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useCallback, useEffect, useRef, useState } from "react";
import { buildShareUrl } from "@/lib/admin/app-url";
import {
  buildShareEmailBody,
  buildShareEmailSubject,
  buildShareSmsText,
  formatShareDateTime,
  formatShareExpiry,
  formatShareViewStatus,
} from "@/lib/admin/demo-share-messages";
import { isDemoShareValid } from "@/lib/admin/demo-share-utils";
import {
  createDemoShare,
  extendDemoShare,
  fetchDemoShare,
  isSupabaseConfigured,
  regenerateDemoShare,
  revokeDemoShare,
} from "@/lib/data/demo-share-client";
import type { DemoSite } from "@/types/demo";
import type { DemoShare, ShareExpiryOption } from "@/types/demo-share";
import { SHARE_EXPIRY_OPTIONS } from "@/types/demo-share";

type DemoShareModalProps = {
  demoSite: DemoSite | null;
  onClose: () => void;
  onShareUpdated?: () => void;
};

export function DemoShareModal({ demoSite, onClose, onShareUpdated }: DemoShareModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [share, setShare] = useState<DemoShare | null>(null);
  const [loading, setLoading] = useState(false);
  const [expiryOption, setExpiryOption] = useState<ShareExpiryOption>("30d");
  const [copied, setCopied] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const open = Boolean(demoSite);
  const supabaseReady = isSupabaseConfigured();

  const loadShare = useCallback(async () => {
    if (!demoSite || !supabaseReady) return;
    setLoading(true);
    setError(null);
    try {
      const active = await fetchDemoShare(demoSite.id);
      setShare(active);
    } catch {
      setError("共有情報の読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }, [demoSite, supabaseReady]);

  useEffect(() => {
    if (open) void loadShare();
    else {
      setShare(null);
      setShowQr(false);
      setCopied(null);
      setError(null);
    }
  }, [open, loadShare]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleClose = () => {
    onClose();
  };

  const copyText = async (label: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setError("クリップボードへのコピーに失敗しました");
    }
  };

  const handleCreate = async () => {
    if (!demoSite) return;
    setLoading(true);
    setError(null);
    try {
      const created = await createDemoShare(demoSite.id, expiryOption);
      setShare(created);
      onShareUpdated?.();
    } catch {
      setError("共有URLの発行に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!share) return;
    if (!window.confirm("この共有URLを無効化しますか？")) return;
    setLoading(true);
    try {
      await revokeDemoShare(share.id);
      setShare({ ...share, isActive: false });
      onShareUpdated?.();
    } catch {
      setError("無効化に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!demoSite || !share) return;
    if (!window.confirm("新しいURLを発行すると、現在のURLは無効になります。続けますか？")) {
      return;
    }
    setLoading(true);
    try {
      const next = await regenerateDemoShare(share.id, demoSite.id, expiryOption);
      setShare(next);
      onShareUpdated?.();
    } catch {
      setError("再発行に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async () => {
    if (!share) return;
    setLoading(true);
    try {
      const extended = await extendDemoShare(share.id, expiryOption);
      setShare(extended);
      onShareUpdated?.();
    } catch {
      setError("有効期限の更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (!demoSite) return null;

  const shareUrl = share ? buildShareUrl(share.shareToken) : "";
  const shareValid = share ? isDemoShareValid(share) : false;
  const messageInput = share
    ? {
        prospectName: demoSite.prospectName,
        storeName: demoSite.storeName,
        shareToken: share.shareToken,
        contactPersonName: demoSite.contactPersonName,
      }
    : null;

  return (
    <dialog ref={dialogRef} className="admin-modal admin-modal--share" onClose={handleClose}>
      <div className="admin-modal-content admin-modal-content--share">
        <div className="admin-contract-modal-header">
          <div>
            <h2 className="admin-modal-title">営業用デモ共有</h2>
            <p className="admin-modal-message">{demoSite.storeName}</p>
          </div>
          <button
            type="button"
            className="admin-contract-modal-close"
            onClick={handleClose}
            aria-label="閉じる"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {!supabaseReady ? (
          <p className="admin-form-error admin-form-error--block">
            共有機能には Supabase の設定が必要です。.env.local に
            NEXT_PUBLIC_SUPABASE_URL 等を設定してください。
          </p>
        ) : loading && !share ? (
          <p className="admin-modal-message">読み込み中…</p>
        ) : !share || !shareValid ? (
          <div className="admin-share-create">
            <p className="admin-modal-message">
              電話営業中にSMS・メールで送れる共有URLを発行します。外部端末・シークレットモードからも閲覧できます。
            </p>
            <div className="admin-form-group">
              <label className="admin-form-label" htmlFor="share-expiry-create">
                有効期限
              </label>
              <select
                id="share-expiry-create"
                className="admin-form-select"
                value={expiryOption}
                onChange={(e) => setExpiryOption(e.target.value as ShareExpiryOption)}
              >
                {SHARE_EXPIRY_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              onClick={handleCreate}
              disabled={loading}
            >
              共有URLを発行
            </button>
          </div>
        ) : (
          <>
            <dl className="admin-contract-result-list admin-share-meta">
              <div>
                <dt>共有URL</dt>
                <dd>
                  <code className="admin-code admin-share-url">{shareUrl}</code>
                </dd>
              </div>
              <div>
                <dt>状態</dt>
                <dd>{share.isActive ? "有効" : "無効"}</dd>
              </div>
              <div>
                <dt>有効期限</dt>
                <dd>{formatShareExpiry(share.expiresAt, share.isActive)}</dd>
              </div>
              <div>
                <dt>閲覧回数</dt>
                <dd>{share.viewCount}回</dd>
              </div>
              <div>
                <dt>初回閲覧</dt>
                <dd>
                  {share.firstViewedAt
                    ? formatShareDateTime(share.firstViewedAt)
                    : "未閲覧"}
                </dd>
              </div>
              <div>
                <dt>最終閲覧</dt>
                <dd>
                  {share.lastViewedAt
                    ? formatShareDateTime(share.lastViewedAt)
                    : "—"}
                </dd>
              </div>
            </dl>

            {showQr ? (
              <div className="admin-share-qr">
                <QRCodeSVG value={shareUrl} size={200} level="M" includeMargin />
                <p className="admin-form-hint">スマートフォンで読み取れます</p>
              </div>
            ) : null}

            <div className="admin-share-actions">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => copyText("url", shareUrl)}
              >
                <Copy size={14} />
                {copied === "url" ? "コピー済" : "URLをコピー"}
              </button>
              {messageInput ? (
                <>
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary"
                    onClick={() => copyText("sms", buildShareSmsText(messageInput))}
                  >
                    <Copy size={14} />
                    {copied === "sms" ? "コピー済" : "SMS文面をコピー"}
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary"
                    onClick={() =>
                      copyText(
                        "email",
                        `件名：${buildShareEmailSubject()}\n\n${buildShareEmailBody(messageInput)}`
                      )
                    }
                  >
                    <Copy size={14} />
                    {copied === "email" ? "コピー済" : "メール文面をコピー"}
                  </button>
                </>
              ) : null}
              <a
                href={shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn--secondary"
              >
                <ExternalLink size={14} />
                共有ページを開く
              </a>
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => setShowQr((v) => !v)}
              >
                <QrCode size={14} />
                {showQr ? "QRを隠す" : "QRコードを表示"}
              </button>
            </div>

            <div className="admin-share-manage">
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="share-expiry-manage">
                  有効期限（延長・再発行）
                </label>
                <select
                  id="share-expiry-manage"
                  className="admin-form-select"
                  value={expiryOption}
                  onChange={(e) => setExpiryOption(e.target.value as ShareExpiryOption)}
                >
                  {SHARE_EXPIRY_OPTIONS.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-share-manage-actions">
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={handleExtend}
                  disabled={loading}
                >
                  有効期限を延長
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost"
                  onClick={handleRegenerate}
                  disabled={loading}
                >
                  新しいURLを再発行
                </button>
                <button
                  type="button"
                  className="admin-btn admin-btn--ghost admin-btn--danger-text"
                  onClick={handleRevoke}
                  disabled={loading}
                >
                  共有URLを無効化
                </button>
              </div>
            </div>
          </>
        )}

        {error ? <p className="admin-form-error">{error}</p> : null}

        <div className="admin-modal-actions">
          <button type="button" className="admin-btn admin-btn--secondary" onClick={handleClose}>
            閉じる
          </button>
        </div>
      </div>
    </dialog>
  );
}

export { formatShareViewStatus };
