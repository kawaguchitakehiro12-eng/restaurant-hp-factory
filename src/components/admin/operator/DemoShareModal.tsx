"use client";

import { Copy, ExternalLink, QrCode, X } from "lucide-react";
import { DemoDeliveryForm } from "@/components/admin/operator/DemoDeliveryForm";
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
import { useOperatorAdmin } from "@/components/admin/operator/OperatorAdminProvider";
import { isApiAuthError } from "@/lib/data/api-errors";
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

export function DemoShareModal(props: DemoShareModalProps) {
  return props.demoSite ? <DemoShareModalInner key={props.demoSite.id} {...props} /> : null;
}

function DemoShareModalInner({ demoSite, onClose, onShareUpdated }: DemoShareModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [share, setShare] = useState<DemoShare | null>(null);
  const [loading, setLoading] = useState(() => isSupabaseConfigured());
  const [expiryOption, setExpiryOption] = useState<ShareExpiryOption>("7d");
  const [copied, setCopied] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const open = Boolean(demoSite);
  const supabaseReady = isSupabaseConfigured();
  const { reportAuthError } = useOperatorAdmin();

  const fail = useCallback(
    (cause: unknown, fallback: string) => {
      reportAuthError(cause);
      setError(isApiAuthError(cause) ? cause.message : fallback);
    },
    [reportAuthError]
  );

  useEffect(() => {
    if (!demoSite || !supabaseReady) return;
    let cancelled = false;
    void fetchDemoShare(demoSite.id).then((active) => {
      if (!cancelled) {setShare(active);setRefreshedAt(new Date().toISOString());}
    }).catch((cause) => { if (!cancelled) fail(cause, "共有情報の読み込みに失敗しました"); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [demoSite, supabaseReady, fail]);

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

  const handleRefresh = async () => {
    if (!demoSite || loading) return;
    setLoading(true);
    setError(null);
    try { setCopied(null);setShare(await fetchDemoShare(demoSite.id)); setRefreshedAt(new Date().toISOString()); }
    catch (cause) { fail(cause, "共有情報を更新できませんでした。時間をおいて再度お試しください。"); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!demoSite) return;
    setLoading(true);
    setError(null);
    try {
      const created = await createDemoShare(demoSite.id, expiryOption);
      setShare(created);
      onShareUpdated?.();
    } catch (cause) {
      fail(cause, "共有URLの発行に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async () => {
    if (!share) return;
    if (!window.confirm("この共有URLを無効化しますか？")) return;
    setError(null);setCopied(null);
    setLoading(true);
    try {
      await revokeDemoShare(share.id);
      setShare({ ...share, isActive: false });
      onShareUpdated?.();
    } catch (cause) {
      fail(cause, "無効化に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (!demoSite || !share) return;
    if (!window.confirm("新しいURLを発行すると、現在のURLは無効になります。続けますか？")) {
      return;
    }
    setError(null);setCopied(null);
    setLoading(true);
    try {
      const next = await regenerateDemoShare(share.id, demoSite.id, expiryOption);
      setShare(next);
      onShareUpdated?.();
    } catch (cause) {
      fail(cause, "再発行に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleExtend = async () => {
    if (!share) return;
    if (!isDemoShareValid(share) && !window.confirm("このURLを再開して期限を延長しますか？以前のURLを知る人も再び閲覧できます。")) return;
    setError(null);setCopied(null);
    setLoading(true);
    try {
      const extended = await extendDemoShare(share.id, expiryOption);
      setShare(extended);
      onShareUpdated?.();
    } catch (cause) {
      fail(cause, "有効期限の更新に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  if (!demoSite) return null;

  const shareUrl = share ? buildShareUrl(share.shareToken) : "";
  const shareValid = share ? isDemoShareValid(share) : false;
  const messageInput = share && shareValid && !error
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
        ) : !share ? (
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
                {SHARE_EXPIRY_OPTIONS.filter(o=>o.id==="7d").map((o) => (
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
                <dd>{!share.isActive ? "停止済み" : isDemoShareValid(share) ? "有効" : "期限切れ"}</dd>
              </div>
              <div>
                <dt>有効期限</dt>
                <dd>{formatShareExpiry(share.expiresAt, share.isActive)}</dd>
              </div>
              <div>
                <dt>ページ表示回数</dt>
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
            <p className="admin-form-hint">閲覧情報はページを開いた時点の記録です。現在の閲覧人数や滞在時間を示すものではありません。</p>
            {refreshedAt ? <p role="status" className="admin-form-hint">最終取得：{formatShareDateTime(refreshedAt)}{error ? "（更新できなかったため前回の情報です）" : ""}</p> : null}

            {!shareValid ? <p role="status" className="admin-form-error">このURLは先方へ送れません。期限・停止状態を確認し、延長または再発行してください。</p> : null}
            {showQr && shareValid && !error ? (
              <div className="admin-share-qr">
                <QRCodeSVG value={shareUrl} size={200} level="M" includeMargin />
                <p className="admin-form-hint">スマートフォンで読み取れます</p>
              </div>
            ) : null}

            <div className="admin-share-actions">
              <button type="button" className="admin-btn admin-btn--secondary" disabled={loading} onClick={() => void handleRefresh()}>{loading ? "更新中…" : "閲覧情報を更新"}</button>
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                disabled={!shareValid || loading || Boolean(error)}
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
                disabled={!shareValid || Boolean(error)}
                onClick={() => setShowQr((v) => !v)}
              >
                <QrCode size={14} />
                {showQr ? "QRを隠す" : "QRコードを表示"}
              </button>
            </div>

            <fieldset disabled={!shareValid || Boolean(error)} style={{border:0,padding:0,margin:0,minWidth:0}}><DemoDeliveryForm key={share.id} site={demoSite} shareId={share.id} /></fieldset>

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
                  {SHARE_EXPIRY_OPTIONS.filter(o=>o.id==="7d").map((o) => (
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
                  {shareValid ? "有効期限を延長" : "このURLを再開して期限を延長"}
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
