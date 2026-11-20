"use client";

import { Download, Loader2 } from "lucide-react";
import type { DemoUrlImportInput } from "@/types/demo-url-import";

type DemoUrlImportStepProps = {
  urls: DemoUrlImportInput;
  onChange: (urls: DemoUrlImportInput) => void;
  loading: boolean;
  error: string | null;
  onFetch: () => void;
  onSkip: () => void;
};

export function DemoUrlImportStep({
  urls,
  onChange,
  loading,
  error,
  onFetch,
  onSkip,
}: DemoUrlImportStepProps) {
  return (
    <div className="admin-import-step">
      <p className="admin-import-lead">
        食べログ・Instagram・公式サイトのURLから、取得できる店舗情報を自動で読み込みます。
        AIは使用しません。
      </p>

      <div className="admin-form-grid">
        <div className="admin-form-group admin-form-group--full">
          <label className="admin-form-label" htmlFor="import-tabelog-url">
            食べログURL
          </label>
          <input
            id="import-tabelog-url"
            type="url"
            className="admin-form-input"
            value={urls.tabelogUrl}
            onChange={(e) => onChange({ ...urls, tabelogUrl: e.target.value })}
            placeholder="https://tabelog.com/tokyo/..."
            disabled={loading}
          />
        </div>
        <div className="admin-form-group admin-form-group--full">
          <label className="admin-form-label" htmlFor="import-instagram-url">
            Instagram URL
          </label>
          <input
            id="import-instagram-url"
            type="url"
            className="admin-form-input"
            value={urls.instagramUrl}
            onChange={(e) => onChange({ ...urls, instagramUrl: e.target.value })}
            placeholder="https://www.instagram.com/..."
            disabled={loading}
          />
        </div>
        <div className="admin-form-group admin-form-group--full">
          <label className="admin-form-label" htmlFor="import-official-url">
            公式サイトURL（任意）
          </label>
          <input
            id="import-official-url"
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

      <div className="admin-import-actions">
        <button
          type="button"
          className="admin-btn admin-btn--primary"
          onClick={onFetch}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 size={16} strokeWidth={1.75} className="admin-import-spinner" />
              情報を取得中…
            </>
          ) : (
            <>
              <Download size={16} strokeWidth={1.75} />
              情報を取得
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
  );
}
