"use client";

import { useMemo } from "react";
import { DemoPhotoAssignmentPanel } from "@/components/admin/operator/DemoPhotoAssignmentPanel";
import { HeroDisplaySettings } from "@/components/admin/HeroDisplaySettings";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { DirtyForm } from "@/components/admin/DirtyForm";
import { SaveBar } from "@/components/admin/SaveBar";
import {
  ensureLibraryHasUrl,
  photosToAssignment,
  syncAssignment,
} from "@/lib/admin/demo-photo-library";
import { createEmptyGalleryPhoto } from "@/lib/stores/demo-samples";
import {
  normalizeHeroFit,
  normalizeHeroObjectPosition,
} from "@/types/hero-display";
import type { DemoGalleryPhoto, DemoPhotos } from "@/types/demo-content";
import type {
  DemoImportedPhoto,
  DemoPhotoAssignment,
} from "@/types/demo-url-import";

export type PhotoEditorPayload = {
  photos: DemoPhotos;
  importedPhotos: DemoImportedPhoto[];
};

type DemoPhotosEditorProps = {
  photos: DemoPhotos;
  importedPhotos: DemoImportedPhoto[];
  onChange: (payload: PhotoEditorPayload) => void;
  onSave?: (payload: PhotoEditorPayload) => void;
  showAssignmentPanel?: boolean;
  showSaveBar?: boolean;
};

export function DemoPhotosEditor({
  photos,
  importedPhotos,
  onChange,
  onSave,
  showAssignmentPanel = true,
  showSaveBar = true,
}: DemoPhotosEditorProps) {
  const assignment = useMemo(
    () => photosToAssignment(photos, importedPhotos),
    [photos, importedPhotos]
  );

  const emit = (next: PhotoEditorPayload) => onChange(next);

  const patchPhotos = (patch: Partial<DemoPhotos>) => {
    emit({
      photos: {
        ...photos,
        ...patch,
        heroFit: normalizeHeroFit(patch.heroFit ?? photos.heroFit),
        heroObjectPosition: normalizeHeroObjectPosition(
          patch.heroObjectPosition ?? photos.heroObjectPosition
        ),
      },
      importedPhotos,
    });
  };

  const patchSlot = (
    key: keyof Omit<DemoPhotos, "gallery" | "heroFit" | "heroObjectPosition">,
    value: string
  ) => {
    const nextLibrary = ensureLibraryHasUrl(importedPhotos, value, key);
    emit({
      photos: { ...photos, [key]: value },
      importedPhotos: nextLibrary,
    });
  };

  const handleAssignmentChange = (next: DemoPhotoAssignment) => {
    const synced = syncAssignment(next, importedPhotos, photos);
    emit(synced);
  };

  const updateGalleryPhoto = (id: string, patch: Partial<DemoGalleryPhoto>) => {
    const gallery = photos.gallery.map((g) => (g.id === id ? { ...g, ...patch } : g));
    let nextLibrary = importedPhotos;
    if (patch.url) {
      nextLibrary = ensureLibraryHasUrl(importedPhotos, patch.url, "ギャラリー");
    }
    emit({ photos: { ...photos, gallery }, importedPhotos: nextLibrary });
  };

  const removeGalleryPhoto = (id: string) => {
    emit({
      photos: { ...photos, gallery: photos.gallery.filter((g) => g.id !== id) },
      importedPhotos,
    });
  };

  const addGalleryPhoto = () => {
    emit({
      photos: {
        ...photos,
        gallery: [...photos.gallery, createEmptyGalleryPhoto(photos.gallery.length + 1)],
      },
      importedPhotos,
    });
  };

  const body = (
    <>
      {showAssignmentPanel && importedPhotos.length > 0 ? (
        <div className="mb-8">
          <DemoPhotoAssignmentPanel
            photos={importedPhotos}
            assignment={assignment}
            onChange={handleAssignmentChange}
            libraryTitle="写真一覧"
          />
        </div>
      ) : null}

      <HeroDisplaySettings
        heroFit={normalizeHeroFit(photos.heroFit)}
        heroObjectPosition={normalizeHeroObjectPosition(photos.heroObjectPosition)}
        previewUrl={photos.hero}
        onChange={(patch) => patchPhotos(patch)}
      />

      <div className="admin-form-grid admin-form-grid--photos mt-8">
        {(
          [
            ["hero", "ファーストビュー画像"],
            ["interior", "店内写真"],
            ["food", "料理写真"],
            ["exterior", "外観写真"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className="admin-form-group admin-form-group--full">
            <ImageUploadField
              label={label}
              value={photos[key]}
              onChange={(value) => patchSlot(key, value)}
            />
          </div>
        ))}
      </div>

      <div className="mt-6">
        <h3 className="admin-edit-subheading">ギャラリー写真</h3>
        <div className="admin-edit-list">
          {photos.gallery.map((photo) => (
            <div key={photo.id} className="admin-edit-list-item">
              <ImageUploadField
                label={`ギャラリー ${photo.sortOrder}`}
                value={photo.url}
                onChange={(value) => updateGalleryPhoto(photo.id, { url: value })}
              />
              <div className="admin-form-grid mt-2">
                <div className="admin-form-group">
                  <label className="admin-form-label">代替テキスト</label>
                  <input
                    className="admin-form-input"
                    value={photo.alt}
                    onChange={(e) =>
                      updateGalleryPhoto(photo.id, { alt: e.target.value })
                    }
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">キャプション</label>
                  <input
                    className="admin-form-input"
                    value={photo.caption}
                    onChange={(e) =>
                      updateGalleryPhoto(photo.id, { caption: e.target.value })
                    }
                  />
                </div>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn--ghost admin-btn--danger-text mt-2"
                onClick={() => removeGalleryPhoto(photo.id)}
              >
                ギャラリーから削除
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--secondary mt-3"
          onClick={addGalleryPhoto}
        >
          + ギャラリー写真を追加
        </button>
      </div>

      {showSaveBar && onSave ? (
        <SaveBar
          saveLabel="写真を保存"
          toastTitle="写真を保存しました"
          toastMessage="公開サイトに反映されました。"
          onSave={() => onSave({ photos, importedPhotos })}
        />
      ) : null}
    </>
  );

  if (showSaveBar) {
    return <DirtyForm className="admin-photos-editor pb-24">{body}</DirtyForm>;
  }

  return <div className="admin-photos-editor">{body}</div>;
}
