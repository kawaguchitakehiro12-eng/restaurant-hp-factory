"use client";
import "./image-library.css";
import {ResilientImage} from "@/components/ui/ResilientImage";
import {useMediaUpload} from '@/components/customer/MediaUploadContext';

import { useEffect, useRef, useState } from "react";
import { readImageFileAsDataUrl } from "@/lib/images/read-image-file";

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  library?: {id:string;url:string;alt?:string;excluded?:boolean}[];
};

export function ImageUploadField({ label, value, onChange, hint,library=[] }: ImageUploadFieldProps) {
  const media=useMediaUpload();
  const latestOnChange = useRef(onChange);
  useEffect(() => { latestOnChange.current = onChange; }, [onChange]);
  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showUrl, setShowUrl] = useState(false);
  const [showLibrary,setShowLibrary]=useState(false);
  const closeLibrary=useRef<HTMLButtonElement>(null);
  const opener=useRef<HTMLButtonElement>(null);
  useEffect(()=>{if(!showLibrary)return;closeLibrary.current?.focus();const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setShowLibrary(false);opener.current?.focus();}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[showLibrary]);
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
            {loading ? "処理中…" : "ファイルをアップロード"}
          </button>
          <button ref={opener} type="button" className="admin-btn admin-btn--secondary" disabled={loading} onClick={()=>setShowLibrary(true)}>画像を選択</button>
          {value ? (
            <button
              type="button"
              className="admin-btn admin-btn--ghost admin-btn--danger-text"
              disabled={loading}
              onClick={() => {if(window.confirm('この写真の割り当てを削除しますか？保存するまで反映されません。'))onChange("");}}
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
      {showLibrary&&<div className="customer-image-library" role="dialog" aria-modal="true" aria-label={label+'の写真ライブラリ'} onKeyDown={event=>{if(event.key==='Tab'){const buttons=Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));const first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus()}}}}><div className="customer-image-library-panel"><h3>写真ライブラリ</h3><button ref={closeLibrary} type="button" className="admin-btn admin-btn--secondary" onClick={()=>{setShowLibrary(false);opener.current?.focus();}}>閉じる</button><p>この店舗で利用できる写真を選択してください。</p><div className="customer-image-library-grid">{library.filter(photo=>!photo.excluded&&photo.url).map(photo=><button type="button" key={photo.id} aria-label={photo.alt||'写真を選択'} onClick={()=>{onChange(photo.url);setShowLibrary(false);opener.current?.focus();}}><ResilientImage src={media?.preview(photo.url)??photo.url} alt={photo.alt||'登録済み写真'}/></button>)}</div>{!library.some(photo=>!photo.excluded&&photo.url)&&<p>登録済み写真はありません。ファイルをアップロードするか、詳細設定からURLを入力してください。</p>}</div></div>}
    </div>
  );
}
