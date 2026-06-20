import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  children: ReactNode;
  hint?: string;
};

export function FormField({ label, children, hint }: FormFieldProps) {
  return (
    <div className="admin-form-group">
      <label className="admin-form-label">{label}</label>
      {children}
      {hint && (
        <p className="text-xs text-[var(--admin-muted)]">{hint}</p>
      )}
    </div>
  );
}

type DesignLockNoticeProps = {
  compact?: boolean;
};

export function DesignLockNotice({ compact }: DesignLockNoticeProps) {
  if (compact) {
    return (
      <p className="text-xs text-[var(--admin-muted)]">
        デザインは固定です。テキスト・写真・メニューのみ編集できます。
      </p>
    );
  }

  return (
    <div className="admin-notice admin-notice--info">
      <div>
        <p className="font-medium">デザインはプロ品質を保つため固定です</p>
        <p className="mt-0.5 text-xs opacity-90">
          店舗情報・写真・メニューのみ編集できます。難しい設定は不要です。
        </p>
      </div>
    </div>
  );
}
