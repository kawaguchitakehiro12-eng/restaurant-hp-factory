"use client";

import { useAdminUi } from "@/components/admin/AdminUiProvider";

type SaveBarProps = {
  saveLabel?: string;
  toastTitle?: string;
  toastMessage?: string;
  onSave?: () => void;
};

export function SaveBar({
  saveLabel = "変更を保存",
  toastTitle = "保存しました",
  toastMessage = "サイトへ反映されました",
  onSave,
}: SaveBarProps) {
  const { showToast, setDirty } = useAdminUi();

  const handleSave = () => {
    onSave?.();
    setDirty(false);
    showToast(toastTitle, toastMessage);
  };

  return (
    <div className="admin-save-bar admin-save-bar--bottom admin-save-bar--fixed">
      <div className="admin-save-bar-inner">
        <span className="admin-save-hint">変更は保存ボタンで反映されます</span>
        <div className="admin-save-actions">
          <button type="button" className="admin-btn admin-btn--secondary">
            キャンセル
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleSave}
          >
            {saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
