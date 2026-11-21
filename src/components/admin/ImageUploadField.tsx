"use client";
import {ResilientImage} from "@/components/ui/ResilientImage";
import {useMediaUpload} from '@/components/customer/MediaUploadContext';

import { useEffect, useRef, useState } from "react";
import { readImageFileAsDataUrl } from "@/lib/images/read-image-file";

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
};

export function ImageUploadField({ label, value, onChange, hint }: ImageUploadFieldProps) {
  const media=useMediaUpload();
  const latestOnChange = useRef(onChange);
  useEffect(() => { latestOnChange.current = onChange; }, [onChange]);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showUrl, setShowUrl] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const dataUrl = media?await media.upload(file):await readImageFileAsDataUrl(file);
      if (mounted.current) latestOnChange.current(dataUrl);
    } catch (e) {
      if (mounted.current) setError(e instanceof Error ? e.message : "アップロードに失敗しました");
    } finally {
      if (mounted.current) setLoading(false);
    }
  };

  return (
    <div className="admin-image-upload" aria-busy={loading}>
      <label className="admin-form-label">{label}</label>
      {hint ? <p className="admin-form-hint">{hint}</p> : null}

      <div className="admin-image-upload-body">
        <div className="admin-image-upload-preview">
          {value ? (
            <ResilientImage src={media?.preview(value)??value} alt={`${label}プレビュー`} />
          ) : (
            <span className="admin-image-upload-placeholder">未登録</span>
          )}
        </div>

        <div className="admin-image-upload-actions">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            disabled={loading}
            className="sr-only"
            onChange={(e) => { const file = e.target.files?.[0]; e.target.value = ""; void handleFile(file); }}
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
              disabled={loading}
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
          disabled={loading}
          placeholder="https://..."
        />
      ) : null}

      {error ? <p className="admin-form-error">{error}</p> : null}
    </div>
  );
}
