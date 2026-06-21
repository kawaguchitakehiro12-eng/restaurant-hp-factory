"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, ZoomIn } from "lucide-react";
import type {
  DemoImportedPhoto,
  DemoPhotoAssignment,
  DemoPhotoStats,
  PhotoSlotKey,
} from "@/types/demo-url-import";
import { PHOTO_SLOT_LABELS } from "@/types/demo-url-import";

const DRAG_MIME = "application/x-sakupage-photo-id";

const SINGLE_SLOTS: Exclude<PhotoSlotKey, "gallery">[] = [
  "hero",
  "exterior",
  "interior",
  "food",
];

type DemoPhotoAssignmentPanelProps = {
  photos: DemoImportedPhoto[];
  photoStats?: DemoPhotoStats;
  assignment: DemoPhotoAssignment;
  onChange: (assignment: DemoPhotoAssignment) => void;
  onToggleExclude?: (photoId: string) => void;
  libraryTitle?: string;
};

export function DemoPhotoAssignmentPanel({
  photos,
  photoStats,
  assignment,
  onChange,
  onToggleExclude,
  libraryTitle = "取得した写真",
}: DemoPhotoAssignmentPanelProps) {
  const photoMap = useCallback(
    (id: string) => photos.find((p) => p.id === id),
    [photos]
  );
  const [previewPhoto, setPreviewPhoto] = useState<DemoImportedPhoto | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);

  const assignSingle = (slot: Exclude<PhotoSlotKey, "gallery">, photoId: string) => {
    onChange({ ...assignment, [slot]: photoId });
  };

  const clearSingle = (slot: Exclude<PhotoSlotKey, "gallery">) => {
    onChange({ ...assignment, [slot]: null });
  };

  const appendGallery = (photoId: string) => {
    onChange({ ...assignment, gallery: [...assignment.gallery, photoId] });
  };

  const removeGalleryAt = (index: number) => {
    onChange({
      ...assignment,
      gallery: assignment.gallery.filter((_, i) => i !== index),
    });
  };

  const readDragPhotoId = (e: React.DragEvent): string | null => {
    const id = e.dataTransfer.getData(DRAG_MIME);
    return id || null;
  };

  const handleDragOver = (e: React.DragEvent, slotKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setDragOverSlot(slotKey);
  };

  const handleDragLeave = (slotKey: string) => {
    setDragOverSlot((prev) => (prev === slotKey ? null : prev));
  };

  if (photos.length === 0) {
    return (
      <div className="admin-photo-assign-empty">
        <p>取得できた写真がありません。</p>
        <p className="admin-form-hint">
          公開デモサイトでは、各スロットにサンプル画像が表示されます。
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="admin-photo-assign-v2">
        <div className="admin-photo-assign-v2-head">
          <h3 className="admin-import-review-title">写真の割り当て</h3>
          <p className="admin-import-review-note">
            下の写真一覧からドラッグして、各スロットにドロップしてください。写真は一覧に残ったまま、何度でも割り当てできます。
          </p>
        </div>

        <div className="admin-photo-assign-v2-slots">
          {SINGLE_SLOTS.map((slot) => {
            const photoId = assignment[slot];
            const photo = photoId ? photoMap(photoId) : undefined;
            const isOver = dragOverSlot === slot;

            return (
              <div key={slot} className="admin-photo-slot-wrap">
                <span className="admin-photo-slot-label">{PHOTO_SLOT_LABELS[slot]}</span>
                <div
                  className={`admin-photo-slot${photo ? " admin-photo-slot--filled" : ""}${
                    isOver ? " admin-photo-slot--over" : ""
                  }`}
                  onDragOver={(e) => handleDragOver(e, slot)}
                  onDragLeave={() => handleDragLeave(slot)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverSlot(null);
                    const id = readDragPhotoId(e);
                    if (id) assignSingle(slot, id);
                  }}
                >
                  {photo ? (
                    <AssignedPhoto
                      photo={photo}
                      onPreview={() => setPreviewPhoto(photo)}
                      onRemove={() => clearSingle(slot)}
                    />
                  ) : (
                    <EmptySlotHint label={PHOTO_SLOT_LABELS[slot]} />
                  )}
                </div>
              </div>
            );
          })}

          <div className="admin-photo-slot-wrap admin-photo-slot-wrap--gallery">
            <span className="admin-photo-slot-label">
              ギャラリー
              {assignment.gallery.length > 0 ? (
                <span className="admin-photo-slot-count">{assignment.gallery.length}枚</span>
              ) : null}
            </span>
            <div
              className={`admin-photo-slot admin-photo-slot--gallery${
                dragOverSlot === "gallery" ? " admin-photo-slot--over" : ""
              }`}
              onDragOver={(e) => handleDragOver(e, "gallery")}
              onDragLeave={() => handleDragLeave("gallery")}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverSlot(null);
                const id = readDragPhotoId(e);
                if (id) appendGallery(id);
              }}
            >
              {assignment.gallery.length > 0 ? (
                <div className="admin-photo-gallery-grid">
                  {assignment.gallery.map((id, index) => {
                    const photo = photoMap(id);
                    if (!photo) return null;
                    return (
                      <AssignedPhoto
                        key={`${id}-${index}`}
                        photo={photo}
                        size="sm"
                        onPreview={() => setPreviewPhoto(photo)}
                        onRemove={() => removeGalleryAt(index)}
                      />
                    );
                  })}
                  <div className="admin-photo-gallery-add">
                    <span>＋ ドロップで追加</span>
                  </div>
                </div>
              ) : (
                <EmptySlotHint label="ギャラリー" multi />
              )}
            </div>
          </div>
        </div>

        <div className="admin-photo-library">
          <div className="admin-photo-library-head">
            <span className="admin-photo-library-title">{libraryTitle}</span>
            {photoStats ? (
              <div className="admin-photo-library-stats">
                {photoStats.tabelog > 0 ? (
                  <span>食べログ {photoStats.tabelog}</span>
                ) : null}
                {photoStats.instagram > 0 ? (
                  <span>Instagram {photoStats.instagram}</span>
                ) : null}
                {photoStats.official > 0 ? (
                  <span>公式 {photoStats.official}</span>
                ) : null}
                <span className="admin-photo-library-total">合計 {photos.length}枚</span>
              </div>
            ) : (
              <span className="admin-photo-library-total">合計 {photos.length}枚</span>
            )}
          </div>
          <div className="admin-photo-library-scroll">
            {photos.map((photo) => (
              <PhotoLibraryItem
                key={photo.id}
                photo={photo}
                onPreview={() => setPreviewPhoto(photo)}
                onToggleExclude={
                  onToggleExclude ? () => onToggleExclude(photo.id) : undefined
                }
              />
            ))}
          </div>
        </div>
      </div>

      <PhotoLightbox photo={previewPhoto} onClose={() => setPreviewPhoto(null)} />
    </>
  );
}

function PhotoLibraryItem({
  photo,
  onPreview,
  onToggleExclude,
}: {
  photo: DemoImportedPhoto;
  onPreview: () => void;
  onToggleExclude?: () => void;
}) {
  const didDrag = useRef(false);

  const handleDragStart = (e: React.DragEvent) => {
    didDrag.current = true;
    e.dataTransfer.setData(DRAG_MIME, photo.id);
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragEnd = () => {
    window.setTimeout(() => {
      didDrag.current = false;
    }, 0);
  };

  return (
    <div
      className={`admin-photo-library-item${photo.excluded ? " admin-photo-library-item--excluded" : ""}`}
      draggable={!photo.excluded}
      onDragStart={photo.excluded ? undefined : handleDragStart}
      onDragEnd={photo.excluded ? undefined : handleDragEnd}
      onClick={() => {
        if (!didDrag.current) onPreview();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onPreview();
        }
      }}
      aria-label={`${photo.alt || "写真"}をプレビュー`}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photo.url} alt={photo.alt} draggable={false} />
      <span className="admin-photo-library-source">{photo.source}</span>
      {onToggleExclude ? (
        <button
          type="button"
          className="admin-photo-library-exclude"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExclude();
          }}
          aria-label={photo.excluded ? "使用する" : "この写真を使用しない"}
          title={photo.excluded ? "使用する" : "この写真を使用しない"}
        >
          {photo.excluded ? "使用する" : "使用しない"}
        </button>
      ) : null}
      <span className="admin-photo-library-zoom" aria-hidden>
        <ZoomIn size={14} strokeWidth={1.75} />
      </span>
    </div>
  );
}

function AssignedPhoto({
  photo,
  onPreview,
  onRemove,
  size = "md",
}: {
  photo: DemoImportedPhoto;
  onPreview: () => void;
  onRemove: () => void;
  size?: "md" | "sm";
}) {
  return (
    <div className={`admin-photo-assigned admin-photo-assigned--${size}`}>
      <button type="button" className="admin-photo-assigned-img" onClick={onPreview}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt={photo.alt} draggable={false} />
      </button>
      <button
        type="button"
        className="admin-photo-assigned-remove"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        aria-label="割り当てを解除"
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

function EmptySlotHint({ label, multi = false }: { label: string; multi?: boolean }) {
  return (
    <div className="admin-photo-slot-empty">
      <span className="admin-photo-slot-empty-icon">↓</span>
      <span className="admin-photo-slot-empty-text">
        {multi ? `${label}にドロップ` : `ここに${label}をドロップ`}
      </span>
      <span className="admin-photo-slot-empty-sub">未割り当てはサンプル表示</span>
    </div>
  );
}

function PhotoLightbox({
  photo,
  onClose,
}: {
  photo: DemoImportedPhoto | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!photo) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [photo, onClose]);

  if (!photo) return null;

  return (
    <div
      className="admin-photo-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="写真プレビュー"
      onClick={onClose}
    >
      <div className="admin-photo-lightbox-inner" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="admin-photo-lightbox-close"
          onClick={onClose}
          aria-label="閉じる"
        >
          <X size={20} strokeWidth={1.75} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt={photo.alt} />
        <p className="admin-photo-lightbox-caption">
          {photo.alt || "写真"} · {photo.source}
        </p>
      </div>
    </div>
  );
}
