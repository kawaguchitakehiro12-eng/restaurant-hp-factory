"use client";
import {minimumTermEndDate as fixedTermEndDate} from "@/lib/admin/minimum-term";
import {isMinimumTermMonths} from "@/lib/admin/minimum-term";

import { Check, Copy, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useOperatorAdmin } from "@/components/admin/operator/OperatorAdminProvider";
import {
  DOMAIN_STATUS_OPTIONS,
  MINIMUM_TERM_MONTHS,
} from "@/lib/admin/contract-templates";
import { parseAgreedMonthlyFee, generateTempPassword, isValidEmail, todayIso } from "@/lib/admin/form-utils";
import { formatDate } from "@/lib/admin/labels";
import { isApiAuthError } from "@/lib/data/api-errors";
import type { ConvertToContractForm, ConvertToContractResult } from "@/types/demo";
import type { DomainStatus } from "@/types/contract";

export function ConvertToContractModal() {
  const { convertModalDemoId } = useOperatorAdmin();
  return convertModalDemoId ? <ConvertToContractModalInner key={convertModalDemoId} /> : null;
}

function ConvertToContractModalInner() {
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
    minimumTermMonths:MINIMUM_TERM_MONTHS,
    monthlyFee: 0,
    loginEmail: demoSite?.email || "",
    initialPassword: generateTempPassword(),
    domainStatus: "unset",
  });
  const [feeInput,setFeeInput]=useState("");
  const [agreementConfirmed,setAgreementConfirmed]=useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ConvertToContractForm, string>>>({});
  const [completed, setCompleted] = useState<ConvertToContractResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const open = Boolean(convertModalDemoId && demoSite);

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

  const minimumTermEndDate = form.contractStartDate&&isMinimumTermMonths(form.minimumTermMonths)
    ? fixedTermEndDate(form.contractStartDate)
    : "";

  const handleSubmit = async () => {
    if (submitting || !convertModalDemoId) return;
    const nextErrors: Partial<Record<keyof ConvertToContractForm, string>> = {};
    if (!form.loginEmail.trim()) nextErrors.loginEmail = "ログインメールを入力してください";
    else if (!isValidEmail(form.loginEmail)) {
      nextErrors.loginEmail = "有効なメールアドレスを入力してください";
    }
    if (form.initialPassword.length < 12) {
      nextErrors.initialPassword = "初期パスワードは12文字以上にしてください";
    }
    const agreedFee=parseAgreedMonthlyFee(feeInput);
    if(agreedFee===null)nextErrors.monthlyFee="合意した月額料金を0〜1,000,000円の整数で入力してください";
    if(!isMinimumTermMonths(form.minimumTermMonths))nextErrors.minimumTermMonths="最低利用期間は契約開始月を含む6か月です";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if(!agreementConfirmed){setSubmitError("外部契約と公開の確認が必要です。");return;}
    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await convertToContract(convertModalDemoId, {...form,monthlyFee:agreedFee!});
      setCompleted(result);
    } catch (error) {
      setSubmitError(
        isApiAuthError(error)
          ? `${error.message}契約切り替えは完了していません。`
          : "契約切り替えに失敗しました。一部が保存されていない可能性があるため、一覧で状態を確認してください。"
      );
    } finally {
      setSubmitting(false);
    }
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
                <label className="admin-form-label" htmlFor="convert-fee">合意済み月額料金（円） <span className="admin-form-required">*</span></label>
                <input
                  className="admin-form-input"
                  id="convert-fee"
                  type="text"
                  inputMode="numeric"
                  value={feeInput}
                  maxLength={7}
                  placeholder="契約書で合意した金額"
                  onChange={e=>setFeeInput(e.target.value)}
                  disabled={submitting}
                  aria-invalid={Boolean(errors.monthlyFee)}
                />
                {errors.monthlyFee&&<p className="admin-form-error">{errors.monthlyFee}</p>}
              </div>
              <div className="admin-form-group"><label className="admin-form-label" htmlFor="convert-term-months">最低利用期間</label><input id="convert-term-months" className="admin-form-input" type="number" min={1} max={120} step={1} value={Number.isFinite(form.minimumTermMonths)?form.minimumTermMonths:""} disabled={submitting} onChange={e=>setForm(prev=>({...prev,minimumTermMonths:e.target.valueAsNumber}))}/>{errors.minimumTermMonths&&<p className="admin-form-error">{errors.minimumTermMonths}</p>}</div>
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
                  <p className="admin-form-hint">この選択だけでは独自ドメインで公開されません。独自ドメインの提供可否は別途確認し、それまでは標準の店舗URLをご案内ください。</p>
              </div>
            </div>

            <p className="admin-form-hint">料金は契約書と照合してください。最低利用期間は契約書で合意した月数を入力してください。この操作は顧客アカウントを作成し、店舗HPを公開します。</p>
            <label className="admin-form-label"><input type="checkbox" checked={agreementConfirmed} disabled={submitting} onChange={e=>setAgreementConfirmed(e.target.checked)}/> 表示条件で外部契約に合意し、顧客アカウント作成・店舗HP公開を実行してよいことを確認しました</label>
            {submitError ? (
              <p className="admin-form-error admin-form-error--block" role="alert">
                {submitError}
              </p>
            ) : null}

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
                onClick={() => void handleSubmit()}
                disabled={submitting||!agreementConfirmed}
              >
                {submitting ? "処理中…" : "契約を確定する"}
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
