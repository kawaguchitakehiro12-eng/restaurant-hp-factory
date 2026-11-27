"use client";

import { useEffect, useMemo, useState } from "react";
import { DemoPhotosEditor } from "@/components/admin/DemoPhotosEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import {
  buildPhotoLibrary,
  initPhotoEditorFromStore,
} from "@/lib/admin/demo-photo-library";
import type { PhotoEditorPayload } from "@/components/admin/DemoPhotosEditor";
import { getStoreBySlug } from "@/data/stores";
import {
  loadStorePhotoOverride,
  saveStorePhotoOverride,
  STORE_PHOTO_OVERRIDES_KEY,
} from "@/lib/stores/store-photo-overrides";

type CustomerPhotosPageClientProps = {
  storeSlug: string;
  storeName: string;
};

export function CustomerPhotosPageClient({
  storeSlug,
  storeName,
}: CustomerPhotosPageClientProps) {
  const baseStore = getStoreBySlug(storeSlug);

  const loadState = useMemo((): PhotoEditorPayload | null => {
    if (!baseStore) return null;
    const override = loadStorePhotoOverride(storeSlug);
    if (override) {
      return {
        photos: override.photos,
        importedPhotos: buildPhotoLibrary(
          override.photos,
          contentImportedFromGallery(override.photos)
        ),
      };
    }
    return initPhotoEditorFromStore(baseStore);
  }, [baseStore, storeSlug]);

  const [editorState, setEditorState] = useState<PhotoEditorPayload | null>(loadState);

  useEffect(() => {
    if (!baseStore) return;

    const reload = () => {
      const override = loadStorePhotoOverride(storeSlug);
      if (override) {
        setEditorState({
          photos: override.photos,
          importedPhotos: buildPhotoLibrary(
            override.photos,
            contentImportedFromGallery(override.photos)
          ),
        });
        return;
      }
      setEditorState(initPhotoEditorFromStore(baseStore));
    };

    reload();
    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === STORE_PHOTO_OVERRIDES_KEY) reload();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [baseStore, storeSlug]);

  if (!baseStore || !editorState) {
    return (
      <div className="admin-edit-empty">
        <p>店舗情報が見つかりません。</p>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="写真管理"
        description={`${storeName} — 各セクションの写真をアップロード・差し替え`}
      />
      <DemoPhotosEditor
        photos={editorState.photos}
        importedPhotos={editorState.importedPhotos}
        onChange={setEditorState}
        onSave={(payload) => saveStorePhotoOverride(storeSlug, payload.photos)}
        showAssignmentPanel={editorState.importedPhotos.length > 1}
      />
    </>
  );
}

function contentImportedFromGallery(
  photos: PhotoEditorPayload["photos"]
): import("@/types/demo-url-import").DemoImportedPhoto[] {
  return photos.gallery.map((g) => ({
    id: g.id,
    url: g.url,
    alt: g.alt,
    source: "upload" as const,
  }));
}
