"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
  confirmVariant?: "primary" | "danger";
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  children,
  confirmVariant = "primary",
}: ConfirmModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog ref={dialogRef} className="admin-modal" onClose={onCancel}>
      <div className="admin-modal-content">
        <h3 className="admin-modal-title">{title}</h3>
        {message && <p className="admin-modal-message">{message}</p>}
        {children}
        <div className="admin-modal-actions">
          <button
            type="button"
            className="admin-btn admin-btn--secondary"
            onClick={onCancel}
          >
            キャンセル
          </button>
          <button
            type="button"
            className={`admin-btn ${
              confirmVariant === "danger" ? "admin-btn--danger" : "admin-btn--primary"
            }`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
