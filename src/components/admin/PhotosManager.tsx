"use client";

import Image from "next/image";
import { Upload } from "lucide-react";
import { DirtyForm } from "@/components/admin/DirtyForm";
import { SaveBar } from "@/components/admin/SaveBar";
import {
  getPhotoCompleteness,
  getPhotoTitle,
  groupPhotosByCategory,
} from "@/lib/admin/photos";
import type { StorePhoto } from "@/types/store";

type PhotosManagerProps = {
  photos: StorePhoto[];
};

function PhotoStars({ count }: { count: number }) {
  return (
    <span className="admin-photo-stars" aria-label={`充実度 ${count}/5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} data-filled={i < count ? "true" : "false"}>
          ★
        </span>
      ))}
    </span>
  );
}

function PhotoCard({ photo }: { photo: StorePhoto }) {
  return (
    <div className="admin-photo-card admin-photo-card--simple">
      <div className="admin-photo-preview">
        <Image
          src={photo.url}
          alt={photo.alt}
          fill
          sizes="(max-width: 768px) 50vw, 200px"
          className="admin-photo-preview-img"
        />
      </div>
      <div className="admin-photo-body">
        <p className="admin-photo-title">{getPhotoTitle(photo)}</p>
        <button type="button" className="admin-btn admin-btn--secondary admin-btn--block">
          <Upload size={14} strokeWidth={1.75} />
          画像を変更
        </button>
      </div>
    </div>
  );
}

export function PhotosManager({ photos }: PhotosManagerProps) {
  const completeness = getPhotoCompleteness(photos);
  const categories = groupPhotosByCategory(photos);

  return (
    <DirtyForm className="admin-photos-manager">
      <div className="admin-card admin-photo-score">
        <div className="admin-photo-score-main">
          <p className="admin-photo-score-label">
            写真充実度 {completeness.percent}%
          </p>
          <PhotoStars count={completeness.stars} />
        </div>
        <p className="admin-photo-score-desc">
          {completeness.remaining > 0
            ? `あと${completeness.remaining}枚で魅力UP`
            : "推奨枚数に達しています"}
          <span className="admin-photo-score-tip">
            推奨：横1200px以上 · 料理が中央に写っている写真
          </span>
        </p>
      </div>

      {categories.map((category) => (
        <section key={category.key} className="admin-photo-category">
          <div className="admin-photo-category-head">
            <h2>【{category.label}】</h2>
            <span className="admin-photo-category-count">
              {category.count}枚 · 推奨{category.recommended}枚
            </span>
          </div>
          <div className="admin-photo-grid admin-photo-grid--compact">
            {category.photos.length > 0 ? (
              category.photos.map((photo) => (
                <PhotoCard key={photo.id} photo={photo} />
              ))
            ) : (
              <div className="admin-photo-empty">
                <p className="admin-photo-empty-title">
                  画像を追加して
                  <br />
                  店舗の魅力を伝えましょう
                </p>
                <button type="button" className="admin-btn admin-btn--primary">
                  <Upload size={14} strokeWidth={1.75} />
                  画像を追加
                </button>
              </div>
            )}
          </div>
        </section>
      ))}

      <SaveBar />
    </DirtyForm>
  );
}
