"use client";

import { useRef, useState } from "react";
import { useAdminUi } from "@/components/admin/AdminUiProvider";

type SaveBarProps = {
  saveLabel?: string;
  toastTitle?: string;
  toastMessage?: string;
  onSave?: () => void | Promise<void>;
};

export function SaveBar({
  saveLabel = "変更を保存",
  toastTitle = "保存しました",
  toastMessage = "サイトへ反映されました",
  onSave,
}: SaveBarProps) {
  const { showToast, getDirtyRevision, markSaved } = useAdminUi();
  const [saving, setSaving] = useState(false);
  const [failure,setFailure]=useState("");
  const savingRef = useRef(false);

  const handleSave = async () => {
    if (!onSave || savingRef.current) return;
    savingRef.current = true;
    setSaving(true);setFailure("");
    const revision = getDirtyRevision();
    try {
      await onSave();
      const unchanged = markSaved(revision);
      showToast(toastTitle, unchanged ? toastMessage : "保存中に追加した変更は未保存です。もう一度保存してください。");
    } catch {
      setFailure("保存結果を確認できません。入力内容は保持されています。保存済み内容を確認してから再試行してください。");
      // 未保存の変更を維持し、成功通知は表示しない。
      showToast("保存できませんでした", "変更は保存されていません。通信状況を確認して再度お試しください。", "error");
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="admin-save-bar admin-save-bar--bottom admin-save-bar--fixed">
      <div className="admin-save-bar-inner">
        {failure&&<p role="alert" className="admin-form-error">{failure}</p>}
        <span className="admin-save-hint" role="status">
          {!onSave ? "この画面の保存機能は準備中です" : saving ? "保存しています…" : "変更は保存ボタンで反映されます"}
        </span>
        <div className="admin-save-actions">
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={handleSave}
            disabled={!onSave || saving}
            aria-busy={saving}
          >
            {saving ? "保存中…" : saveLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
