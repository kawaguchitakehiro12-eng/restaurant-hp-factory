"use client";

import { useEffect, useMemo, useState } from "react";
import { DemoPhotosEditor } from "@/components/admin/DemoPhotosEditor";
import { PageHeader } from "@/components/admin/PageHeader";
import type { PhotoEditorPayload } from "@/components/admin/DemoPhotosEditor";
import { buildPhotoLibrary } from "@/lib/admin/demo-photo-library";
import { ensureDemoContent } from "@/types/demo-content";
import { useDemoCustomer } from "@/components/dashboard/demo/DemoCustomerProvider";

export function DemoCustomerPhotosPage() {
  const { demo, savePhotos } = useDemoCustomer();
  const content = ensureDemoContent(demo.content);

  const initial = useMemo<PhotoEditorPayload>(
    () => ({
      photos: content.photos,
      importedPhotos: buildPhotoLibrary(content.photos, content.importedPhotos ?? []),
    }),
    [content.photos, content.importedPhotos]
  );

  const [editorState, setEditorState] = useState(initial);

  useEffect(() => {
    setEditorState(initial);
  }, [demo.lastUpdatedAt, initial]);

  return (
    <>
      <PageHeader
        title="写真管理"
        description="各セクションの写真をアップロード・差し替え"
      />
      <DemoPhotosEditor
        photos={editorState.photos}
        importedPhotos={editorState.importedPhotos}
        onChange={setEditorState}
        onSave={(payload) => savePhotos(payload)}
        showAssignmentPanel={editorState.importedPhotos.length > 1}
      />
    </>
  );
}
