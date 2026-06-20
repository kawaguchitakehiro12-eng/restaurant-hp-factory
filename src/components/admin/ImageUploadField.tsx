"use client";

import { useRef, useState } from "react";
import { readImageFileAsDataUrl } from "@/lib/images/read-image-file";

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
};

export function ImageUploadField({ label, value, onChange, hint }: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showUrl, setShowUrl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const dataUrl = await readImageFileAsDataUrl(file);
      onChange(dataUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "アップロードに失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-image-upload">
      <label className="admin-form-label">{label}</label>
      {hint ? <p className="admin-form-hint">{hint}</p> : null}

      <div className="admin-image-upload-body">
        <div className="admin-image-upload-preview">
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={`${label}プレビュー`} />
          ) : (
            <span className="admin-image-upload-placeholder">未登録</span>
          )}
        </div>

        <div className="admin-image-upload-actions">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            className="admin-btn admin-btn--secondary"
            disabled={loading}
            onClick={() => inputRef.current?.click()}
          >
            {loading ? "処理中…" : value ? "画像を差し替え" : "画像を選択"}
          </button>
          {value ? (
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--danger-text"
              onClick={() => onChange("")}
            >
              削除
            </button>
          ) : null}
          <button
            type="button"
            className="admin-btn admin-btn--ghost text-xs"
            onClick={() => setShowUrl((v) => !v)}
          >
            {showUrl ? "詳細設定を閉じる" : "詳細設定（URL入力）"}
          </button>
        </div>
      </div>

      {showUrl ? (
        <input
          className="admin-form-input mt-2"
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
        />
      ) : null}

      {error ? <p className="admin-form-error">{error}</p> : null}
    </div>
  );
}
