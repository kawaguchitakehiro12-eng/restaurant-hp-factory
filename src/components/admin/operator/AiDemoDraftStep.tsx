"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import type { AiDemoDraftInput } from "@/types/ai-demo-draft";

type AiDemoDraftStepProps = {
  urls: AiDemoDraftInput;
  onChange: (urls: AiDemoDraftInput) => void;
  loading: boolean;
  aiUsed: boolean;
  error: string | null;
  onGenerate: () => void;
  onSkip: () => void;
};

export function AiDemoDraftStep({
  urls,
  onChange,
  loading,
  aiUsed,
  error,
  onGenerate,
  onSkip,
}: AiDemoDraftStepProps) {
  const [showRerunModal, setShowRerunModal] = useState(false);

  const handleGenerateClick = () => {
    if (aiUsed) {
      setShowRerunModal(true);
      return;
    }
    onGenerate();
  };

  return (
    <>
      <div className="admin-ai-step">
        <div className="admin-ai-badge">
          <Sparkles size={14} strokeWidth={1.75} />
          運営専用 AI
        </div>

        <p className="admin-ai-lead">
          食べログ・Instagram・公式サイトのURLから、デモサイトに必要な情報を自動入力します。
        </p>

        <p className="admin-ai-policy">
          AIは運営側のデモ作成時のみ使用されます。顧客側管理画面では利用できません。
        </p>

        <div className="admin-form-grid">
          <div className="admin-form-group admin-form-group--full">
            <label className="admin-form-label" htmlFor="ai-tabelog-url">
              食べログURL
            </label>
            <input
              id="ai-tabelog-url"
              type="url"
              className="admin-form-input"
              value={urls.tabelogUrl}
              onChange={(e) => onChange({ ...urls, tabelogUrl: e.target.value })}
              placeholder="https://tabelog.com/tokyo/..."
              disabled={loading}
            />
          </div>
          <div className="admin-form-group admin-form-group--full">
            <label className="admin-form-label" htmlFor="ai-instagram-url">
              Instagram URL
            </label>
            <input
              id="ai-instagram-url"
              type="url"
              className="admin-form-input"
              value={urls.instagramUrl}
              onChange={(e) => onChange({ ...urls, instagramUrl: e.target.value })}
              placeholder="https://www.instagram.com/..."
              disabled={loading}
            />
          </div>
          <div className="admin-form-group admin-form-group--full">
            <label className="admin-form-label" htmlFor="ai-official-url">
              公式サイトURL（任意）
            </label>
            <input
              id="ai-official-url"
              type="url"
              className="admin-form-input"
              value={urls.officialUrl ?? ""}
              onChange={(e) => onChange({ ...urls, officialUrl: e.target.value })}
              placeholder="https://example.com"
              disabled={loading}
            />
          </div>
        </div>

        {error ? <p className="admin-form-error">{error}</p> : null}

        {aiUsed ? (
          <p className="admin-ai-cost-note">
            このデモ作成ではAIを1回実行済みです。再実行するとAPI利用料が発生します。
          </p>
        ) : null}

        <div className="admin-ai-actions">
          <button
            type="button"
            className="admin-btn admin-btn--primary admin-btn--ai"
            onClick={handleGenerateClick}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} strokeWidth={1.75} className="admin-ai-spinner" />
                AIで下書きを作成中…
              </>
            ) : (
              <>
                <Sparkles size={16} strokeWidth={1.75} />
                AIで下書きを作成
              </>
            )}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={onSkip}
            disabled={loading}
          >
            手入力で作成
          </button>
        </div>
      </div>

      <ConfirmModal
        open={showRerunModal}
        title="AIを再実行しますか？"
        message="AIを再実行するとAPI利用料が発生します。現在の下書き内容は上書きされます。"
        confirmLabel="再実行する"
        confirmVariant="primary"
        onConfirm={() => {
          setShowRerunModal(false);
          onGenerate();
        }}
        onCancel={() => setShowRerunModal(false)}
      />
    </>
  );
}
