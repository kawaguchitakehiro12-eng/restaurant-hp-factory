"use client";

import { Check, Copy, ExternalLink, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { PublishQualityPanel } from "@/components/admin/operator/PublishQualityPanel";
import {
  PublishSiteError,
  useOperatorAdmin,
} from "@/components/admin/operator/OperatorAdminProvider";
import {
  DEFAULT_MONTHLY_FEE,
  DOMAIN_STATUS_OPTIONS,
  getTemplateLabel,
  MINIMUM_TERM_MONTHS,
} from "@/lib/admin/contract-templates";
import { getBusinessTypeLabel } from "@/lib/admin/demo-labels";
import { buildDemoUrl } from "@/lib/admin/demo-create";
import {
  addMonths,
  generateTempPassword,
  isValidEmail,
  isValidSlug,
  normalizeSlug,
  todayIso,
} from "@/lib/admin/form-utils";
import { formatCurrency, formatDate } from "@/lib/admin/labels";
import {
  evaluatePublishQuality,
  PUBLISH_QUALITY_CONFIRM_THRESHOLD,
  PUBLISH_QUALITY_WARN_THRESHOLD,
} from "@/lib/admin/publish-quality-check";
import type { PublishSiteForm, PublishSiteResult } from "@/types/demo";
import type { DomainStatus } from "@/types/contract";

type FlowStep = 1 | 2 | 3;

const STEPS: { id: FlowStep; label: string }[] = [
  { id: 1, label: "サイト情報" },
  { id: 2, label: "公開URL" },
  { id: 3, label: "顧客アカウント" },
];

export function PublishSiteFlow() {
  const {
    publishModalDemoId,
    closePublishModal,
    publishSite,
    getDemoSite,
    isSlugTaken,
  } = useOperatorAdmin();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const demoSite = publishModalDemoId ? getDemoSite(publishModalDemoId) : undefined;

  const [step, setStep] = useState<FlowStep>(1);
  const [form, setForm] = useState<PublishSiteForm>({
    storeSlug: "",
    contractStartDate: todayIso(),
    monthlyFee: DEFAULT_MONTHLY_FEE,
    loginEmail: "",
    initialPassword: generateTempPassword(),
    domainStatus: "unset",
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof PublishSiteForm, string>>
  >({});
  const [completed, setCompleted] = useState<PublishSiteResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [publishConfirmOpen, setPublishConfirmOpen] = useState(false);

  const qualityReport = useMemo(
    () => (demoSite ? evaluatePublishQuality(demoSite) : null),
    [demoSite]
  );
  const publishButtonWarn =
    qualityReport && qualityReport.score < PUBLISH_QUALITY_WARN_THRESHOLD;

  const open = Boolean(publishModalDemoId && demoSite);

  useEffect(() => {
    if (!demoSite) return;
    setStep(1);
    setForm({
      storeSlug: demoSite.storeSlug,
      contractStartDate: todayIso(),
      monthlyFee: DEFAULT_MONTHLY_FEE,
      loginEmail: demoSite.email || "",
      initialPassword: generateTempPassword(),
      domainStatus: "unset",
    });
    setErrors({});
    setCompleted(null);
    setCopied(false);
    setPublishConfirmOpen(false);
  }, [demoSite?.id]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const handleClose = () => {
    closePublishModal();
    setCompleted(null);
  };

  const publicUrlPreview = form.storeSlug
    ? buildDemoUrl(normalizeSlug(form.storeSlug))
    : "";

  const minimumTermEndDate = form.contractStartDate
    ? addMonths(form.contractStartDate, MINIMUM_TERM_MONTHS)
    : "";

  const validateStep = (current: FlowStep): boolean => {
    const nextErrors: Partial<Record<keyof PublishSiteForm, string>> = {};

    if (current === 2) {
      const slug = normalizeSlug(form.storeSlug);
      if (!slug) nextErrors.storeSlug = "公開URL（スラッグ）を入力してください";
      else if (!isValidSlug(slug)) {
        nextErrors.storeSlug = "英小文字・数字・ハイフンのみ使用できます";
      } else if (publishModalDemoId && isSlugTaken(slug, publishModalDemoId)) {
        nextErrors.storeSlug = "このURLはすでに使用されています";
      }
    }

    if (current === 3) {
      if (!form.loginEmail.trim()) {
        nextErrors.loginEmail = "ログインメールを入力してください";
      } else if (!isValidEmail(form.loginEmail)) {
        nextErrors.loginEmail = "有効なメールアドレスを入力してください";
      }
      if (!form.initialPassword.trim()) {
        nextErrors.initialPassword = "初期パスワードを入力してください";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep(step)) return;
    if (step < 3) setStep((step + 1) as FlowStep);
  };

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as FlowStep);
  };

  const executePublish = () => {
    if (!publishModalDemoId || !validateStep(3)) return;
    try {
      const result = publishSite(publishModalDemoId, form);
      setCompleted(result);
      setPublishConfirmOpen(false);
    } catch (error) {
      if (error instanceof PublishSiteError && error.field) {
        setErrors({ [error.field]: error.message });
        if (error.field === "storeSlug") setStep(2);
      }
    }
  };

  const handlePublish = () => {
    if (!publishModalDemoId || !validateStep(3)) return;
    if (
      qualityReport &&
      qualityReport.score < PUBLISH_QUALITY_CONFIRM_THRESHOLD
    ) {
      setPublishConfirmOpen(true);
      return;
    }
    executePublish();
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

  const stepIndicator = (s: (typeof STEPS)[number]) => {
    const isActive = s.id === step;
    const isDone = s.id < step;
    return (
      <li
        key={s.id}
        className={`admin-contract-step${isActive ? " admin-contract-step--active" : ""}${
          isDone ? " admin-contract-step--done" : ""
        }`}
      >
        <span className="admin-contract-step-index">{s.id}</span>
        <span className="admin-contract-step-label">{s.label}</span>
      </li>
    );
  };

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
              {completed ? "公開完了" : "サイトを公開する"}
            </h2>
            {!completed && (
              <p className="admin-modal-message">
                {demoSite.storeName} をデモから正式サイトへ切り替えます。
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
            <ol className="admin-contract-steps" aria-label="公開ステップ">
              {STEPS.map(stepIndicator)}
            </ol>

            {step === 1 && (
              <>
                {qualityReport ? (
                  <PublishQualityPanel report={qualityReport} />
                ) : null}
                <dl className="admin-contract-result-list admin-contract-result-list--after-quality">
                <div>
                  <dt>店舗名</dt>
                  <dd>{demoSite.storeName}</dd>
                </div>
                <div>
                  <dt>業種</dt>
                  <dd>{getBusinessTypeLabel(demoSite.businessType)}</dd>
                </div>
                <div>
                  <dt>テンプレート</dt>
                  <dd>{getTemplateLabel(demoSite.templateId)}</dd>
                </div>
                {demoSite.address ? (
                  <div>
                    <dt>住所</dt>
                    <dd>{demoSite.address}</dd>
                  </div>
                ) : null}
                {demoSite.phone ? (
                  <div>
                    <dt>電話</dt>
                    <dd>{demoSite.phone}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>見込み顧客</dt>
                  <dd>{demoSite.prospectName || "—"}</dd>
                </div>
                {demoSite.contactPersonName ? (
                  <div>
                    <dt>担当者</dt>
                    <dd>{demoSite.contactPersonName}</dd>
                  </div>
                ) : null}
              </dl>
              </>
            )}

            {step === 2 && (
              <div className="admin-form-grid">
                <div className="admin-form-group admin-form-group--full">
                  <label className="admin-form-label" htmlFor="publish-slug">
                    公開URL（スラッグ） <span className="admin-form-required">*</span>
                  </label>
                  <input
                    id="publish-slug"
                    className="admin-form-input"
                    value={form.storeSlug}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        storeSlug: normalizeSlug(e.target.value),
                      }))
                    }
                  />
                  <p className="admin-form-hint">
                    公開URL: /{form.storeSlug || "your-slug"}
                  </p>
                  {errors.storeSlug ? (
                    <p className="admin-form-error">{errors.storeSlug}</p>
                  ) : null}
                  {publicUrlPreview ? (
                    <p className="admin-form-hint">
                      <a
                        href={publicUrlPreview}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {publicUrlPreview}
                      </a>
                    </p>
                  ) : null}
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="publish-start">
                    契約開始日
                  </label>
                  <input
                    id="publish-start"
                    type="date"
                    className="admin-form-input"
                    value={form.contractStartDate}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        contractStartDate: e.target.value,
                      }))
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
                  <label className="admin-form-label">最低利用終了日</label>
                  <input
                    className="admin-form-input"
                    value={
                      minimumTermEndDate ? formatDate(minimumTermEndDate) : "—"
                    }
                    disabled
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="publish-email">
                    顧客ログインメール <span className="admin-form-required">*</span>
                  </label>
                  <input
                    id="publish-email"
                    type="email"
                    className="admin-form-input"
                    value={form.loginEmail}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, loginEmail: e.target.value }))
                    }
                  />
                  {errors.loginEmail ? (
                    <p className="admin-form-error">{errors.loginEmail}</p>
                  ) : null}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="publish-password">
                    初期パスワード <span className="admin-form-required">*</span>
                  </label>
                  <input
                    id="publish-password"
                    className="admin-form-input admin-form-input--mono"
                    value={form.initialPassword}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        initialPassword: e.target.value,
                      }))
                    }
                  />
                  {errors.initialPassword ? (
                    <p className="admin-form-error">{errors.initialPassword}</p>
                  ) : null}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="publish-domain">
                    独自ドメイン
                  </label>
                  <select
                    id="publish-domain"
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
            )}

            <div className="admin-modal-actions admin-modal-actions--contract">
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={step === 1 ? handleClose : handleBack}
              >
                {step === 1 ? "キャンセル" : "戻る"}
              </button>
              {step < 3 ? (
                <button
                  type="button"
                  className="admin-btn admin-btn--primary"
                  onClick={handleNext}
                >
                  次へ
                </button>
              ) : (
                <button
                  type="button"
                  className={`admin-btn ${
                    publishButtonWarn
                      ? "admin-btn--publish-warn-solid"
                      : "admin-btn--primary"
                  }`}
                  onClick={handlePublish}
                >
                  公開する
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="admin-contract-success">
              <div className="admin-contract-success-icon" aria-hidden>
                <Check size={22} strokeWidth={2} />
              </div>
              <p className="admin-contract-success-lead">
                <strong>{completed.storeName}</strong> を公開しました。
              </p>
            </div>

            <dl className="admin-contract-result-list">
              <div>
                <dt>公開URL</dt>
                <dd>
                  <a
                    href={completed.publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {completed.publicUrl}
                  </a>
                </dd>
              </div>
              <div>
                <dt>顧客管理画面URL</dt>
                <dd>
                  <a
                    href={completed.dashboardUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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
                <dt>公開日</dt>
                <dd>{formatDate(completed.publishedAt)}</dd>
              </div>
            </dl>

            <div className="admin-contract-result-actions">
              <a
                href={completed.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn--secondary"
              >
                <ExternalLink size={14} strokeWidth={1.75} />
                公開サイトを見る
              </a>
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

      <ConfirmModal
        open={publishConfirmOpen}
        title="完成度が低い状態で公開しますか？"
        message=""
        confirmLabel="このまま公開する"
        onConfirm={executePublish}
        onCancel={() => setPublishConfirmOpen(false)}
      >
        {qualityReport ? (
          <div className="admin-quality-confirm-body">
            <p className="admin-modal-message">
              完成度 <strong>{qualityReport.score}%</strong> です。不足項目を確認してください。
            </p>
            <ul className="admin-quality-missing admin-quality-missing--confirm">
              {qualityReport.missingLabels.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </ConfirmModal>
    </dialog>
  );
}
