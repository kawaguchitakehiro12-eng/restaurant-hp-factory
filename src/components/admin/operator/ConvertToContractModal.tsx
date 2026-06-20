"use client";

import { Check, Copy, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useOperatorAdmin } from "@/components/admin/operator/OperatorAdminProvider";
import {
  DEFAULT_MONTHLY_FEE,
  DOMAIN_STATUS_OPTIONS,
  MINIMUM_TERM_MONTHS,
} from "@/lib/admin/contract-templates";
import { addMonths, generateTempPassword, isValidEmail, todayIso } from "@/lib/admin/form-utils";
import { formatCurrency, formatDate } from "@/lib/admin/labels";
import type { ConvertToContractForm, ConvertToContractResult } from "@/types/demo";
import type { DomainStatus } from "@/types/contract";

export function ConvertToContractModal() {
  const {
    convertModalDemoId,
    closeConvertModal,
    convertToContract,
    getDemoSite,
  } = useOperatorAdmin();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const demoSite = convertModalDemoId ? getDemoSite(convertModalDemoId) : undefined;

  const [form, setForm] = useState<ConvertToContractForm>({
    contractStartDate: todayIso(),
    monthlyFee: DEFAULT_MONTHLY_FEE,
    loginEmail: "",
    initialPassword: generateTempPassword(),
    domainStatus: "unset",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ConvertToContractForm, string>>>({});
  const [completed, setCompleted] = useState<ConvertToContractResult | null>(null);
  const [copied, setCopied] = useState(false);

  const open = Boolean(convertModalDemoId && demoSite);

  useEffect(() => {
    if (!demoSite) return;
    setForm({
      contractStartDate: todayIso(),
      monthlyFee: DEFAULT_MONTHLY_FEE,
      loginEmail: demoSite.email || "",
      initialPassword: generateTempPassword(),
      domainStatus: "unset",
    });
    setErrors({});
    setCompleted(null);
    setCopied(false);
  }, [demoSite?.id]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleClose = () => {
    closeConvertModal();
    setCompleted(null);
  };

  const minimumTermEndDate = form.contractStartDate
    ? addMonths(form.contractStartDate, MINIMUM_TERM_MONTHS)
    : "";

  const handleSubmit = () => {
    if (!convertModalDemoId) return;
    const nextErrors: Partial<Record<keyof ConvertToContractForm, string>> = {};
    if (!form.loginEmail.trim()) nextErrors.loginEmail = "ログインメールを入力してください";
    else if (!isValidEmail(form.loginEmail)) {
      nextErrors.loginEmail = "有効なメールアドレスを入力してください";
    }
    if (!form.initialPassword.trim()) {
      nextErrors.initialPassword = "初期パスワードを入力してください";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const result = convertToContract(convertModalDemoId, form);
    setCompleted(result);
  };

  const handleCopyInvitation = async () => {
    if (!completed) return;
    try {
      await navigator.clipboard.writeText(completed.invitationText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  if (!demoSite) return null;

  return (
    <dialog
      ref={dialogRef}
      className="admin-modal admin-modal--contract"
      onClose={handleClose}
    >
      <div className="admin-modal-content admin-modal-content--contract">
        <div className="admin-contract-modal-header">
          <div>
            <h2 className="admin-modal-title">
              {completed ? "契約切り替え完了" : "契約へ切り替え"}
            </h2>
            {!completed && (
              <p className="admin-modal-message">
                {demoSite.storeName} をデモから本契約に切り替えます。
              </p>
            )}
          </div>
          <button
            type="button"
            className="admin-contract-modal-close"
            onClick={handleClose}
            aria-label="閉じる"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>

        {!completed ? (
          <>
            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="convert-start">
                  契約開始日
                </label>
                <input
                  id="convert-start"
                  type="date"
                  className="admin-form-input"
                  value={form.contractStartDate}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, contractStartDate: e.target.value }))
                  }
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">月額プラン</label>
                <input
                  className="admin-form-input"
                  value={formatCurrency(DEFAULT_MONTHLY_FEE)}
                  disabled
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">最低利用期間</label>
                <input
                  className="admin-form-input"
                  value={`${MINIMUM_TERM_MONTHS}ヶ月（固定）`}
                  disabled
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">最低利用終了日</label>
                <input
                  className="admin-form-input"
                  value={minimumTermEndDate ? formatDate(minimumTermEndDate) : "—"}
                  disabled
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="convert-email">
                  顧客ログインメール <span className="admin-form-required">*</span>
                </label>
                <input
                  id="convert-email"
                  type="email"
                  className="admin-form-input"
                  value={form.loginEmail}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, loginEmail: e.target.value }))
                  }
                />
                {errors.loginEmail && (
                  <p className="admin-form-error">{errors.loginEmail}</p>
                )}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="convert-password">
                  初期パスワード <span className="admin-form-required">*</span>
                </label>
                <input
                  id="convert-password"
                  className="admin-form-input admin-form-input--mono"
                  value={form.initialPassword}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, initialPassword: e.target.value }))
                  }
                />
                {errors.initialPassword && (
                  <p className="admin-form-error">{errors.initialPassword}</p>
                )}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label" htmlFor="convert-domain">
                  独自ドメイン
                </label>
                <select
                  id="convert-domain"
                  className="admin-form-select"
                  value={form.domainStatus}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      domainStatus: e.target.value as DomainStatus,
                    }))
                  }
                >
                  {DOMAIN_STATUS_OPTIONS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-modal-actions admin-modal-actions--contract">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={handleClose}
              >
                キャンセル
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={handleSubmit}
              >
                契約を確定する
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="admin-contract-success">
              <div className="admin-contract-success-icon" aria-hidden>
                <Check size={22} strokeWidth={2} />
              </div>
              <p className="admin-contract-success-lead">
                <strong>{completed.storeName}</strong> を契約済みに切り替えました。
              </p>
            </div>

            <dl className="admin-contract-result-list">
              <div>
                <dt>顧客管理画面URL</dt>
                <dd>
                  <a href={completed.dashboardUrl} target="_blank" rel="noopener noreferrer">
                    {completed.dashboardUrl}
                  </a>
                </dd>
              </div>
              <div>
                <dt>ログインメール</dt>
                <dd>{completed.loginEmail}</dd>
              </div>
              <div>
                <dt>初期パスワード</dt>
                <dd>
                  <code className="admin-code admin-code--password">
                    {completed.initialPassword}
                  </code>
                </dd>
              </div>
              <div>
                <dt>契約開始日</dt>
                <dd>{formatDate(completed.contractStartDate)}</dd>
              </div>
              <div>
                <dt>最低利用終了日</dt>
                <dd>{formatDate(completed.minimumTermEndDate)}</dd>
              </div>
              <div>
                <dt>独自ドメイン</dt>
                <dd>{completed.domainStatusLabel}</dd>
              </div>
            </dl>

            <div className="admin-contract-result-actions">
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={handleCopyInvitation}
              >
                <Copy size={14} strokeWidth={1.75} />
                {copied ? "コピーしました" : "顧客案内文をコピー"}
              </button>
            </div>

            <div className="admin-modal-actions admin-modal-actions--contract">
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={handleClose}
              >
                閉じる
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
