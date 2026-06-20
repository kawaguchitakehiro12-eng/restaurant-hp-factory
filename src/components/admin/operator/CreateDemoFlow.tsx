"use client";

import { Check, Copy, ExternalLink, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { DemoImportReviewPanel } from "@/components/admin/operator/DemoImportReviewPanel";
import { DemoPhotoAssignmentPanel } from "@/components/admin/operator/DemoPhotoAssignmentPanel";
import { DemoUrlImportStep } from "@/components/admin/operator/DemoUrlImportStep";
import { useOperatorAdmin } from "@/components/admin/operator/OperatorAdminProvider";
import { CONTRACT_TEMPLATE_OPTIONS } from "@/lib/admin/contract-templates";
import {
  applyImportToForm,
  fetchDemoImportFromUrls,
  validateDemoUrlImportInput,
} from "@/lib/admin/demo-url-import";
import { BUSINESS_TYPE_OPTIONS, SALES_STATUS_OPTIONS } from "@/lib/admin/demo-labels";
import { isValidEmail, isValidSlug, normalizeSlug } from "@/lib/admin/demo-create";
import { isReservedSlug } from "@/lib/stores/demo-site-registry";
import { formatDate } from "@/lib/admin/labels";
import type {
  DemoPhotoAssignment,
  DemoUrlImportInput,
  DemoUrlImportResult,
} from "@/types/demo-url-import";
import { emptyPhotoAssignment } from "@/types/demo-url-import";
import type {
  BusinessType,
  ContractTemplateId,
  CreateDemoSiteResult,
  DemoSiteFormInput,
  SalesStatus,
} from "@/types/demo";

type FlowStep = 0 | "import" | 1 | 2 | 3;

const STEPS: { id: FlowStep; label: string }[] = [
  { id: 0, label: "URL取得" },
  { id: 1, label: "店舗情報" },
  { id: 2, label: "テンプレート" },
  { id: 3, label: "営業メモ" },
];

function emptyUrls(): DemoUrlImportInput {
  return { tabelogUrl: "", instagramUrl: "", officialUrl: "" };
}

function emptyForm(): DemoSiteFormInput {
  return {
    storeName: "",
    storeSlug: "",
    businessType: "izakaya",
    sourceUrl: "",
    address: "",
    templateId: "luxury-japanese",
    prospectName: "",
    contactPersonName: "",
    phone: "",
    email: "",
    salesStatus: "not_approached",
    salesMemo: "",
  };
}

function syncFormContent(form: DemoSiteFormInput): DemoSiteFormInput {
  if (!form.content) return form;
  return {
    ...form,
    content: {
      ...form.content,
      basicInfo: {
        ...form.content.basicInfo,
        address: form.address || form.content.basicInfo.address,
        phone: form.phone || form.content.basicInfo.phone,
      },
    },
  };
}

type CreateDemoFlowProps = {
  onRequestConvert: (demoSiteId: string) => void;
};

export function CreateDemoFlow({ onRequestConvert }: CreateDemoFlowProps) {
  const { demoModalOpen, closeDemoModal, addDemoSite, isSlugTaken } = useOperatorAdmin();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<FlowStep>(0);
  const [form, setForm] = useState<DemoSiteFormInput>(emptyForm);
  const [slugTouched, setSlugTouched] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof DemoSiteFormInput, string>>>({});
  const [completed, setCompleted] = useState<CreateDemoSiteResult | null>(null);
  const [copied, setCopied] = useState<"sales" | "customer" | null>(null);

  const [importUrls, setImportUrls] = useState<DemoUrlImportInput>(emptyUrls);
  const [importResult, setImportResult] = useState<DemoUrlImportResult | null>(null);
  const [photoAssignment, setPhotoAssignment] = useState<DemoPhotoAssignment>(
    emptyPhotoAssignment()
  );
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setStep(0);
    setForm(emptyForm());
    setSlugTouched(false);
    setErrors({});
    setCompleted(null);
    setCopied(null);
    setImportUrls(emptyUrls());
    setImportResult(null);
    setPhotoAssignment(emptyPhotoAssignment());
    setImportLoading(false);
    setImportError(null);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (demoModalOpen && !dialog.open) dialog.showModal();
    if (!demoModalOpen && dialog.open) dialog.close();
  }, [demoModalOpen]);

  const handleClose = () => {
    closeDemoModal();
    reset();
  };

  const updateField = <K extends keyof DemoSiteFormInput>(
    key: K,
    value: DemoSiteFormInput[K]
  ) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "storeName" && !slugTouched) {
        next.storeSlug = normalizeSlug(String(value));
      }
      return next;
    });
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateStep = (currentStep: FlowStep): boolean => {
    const nextErrors: Partial<Record<keyof DemoSiteFormInput, string>> = {};

    if (currentStep === 1) {
      if (!form.storeName.trim()) nextErrors.storeName = "店舗名を入力してください";
      const slug = normalizeSlug(form.storeSlug);
      if (!slug) nextErrors.storeSlug = "店舗slugを入力してください";
      else if (!isValidSlug(slug)) {
        nextErrors.storeSlug = "半角英小文字・数字・ハイフンのみ（2文字以上）";
      } else if (isReservedSlug(slug)) {
        nextErrors.storeSlug = "このslugは予約済みのため使用できません";
      } else if (isSlugTaken(slug)) nextErrors.storeSlug = "このslugは既に使用されています";
    }

    if (currentStep === 3) {
      if (!form.prospectName.trim()) nextErrors.prospectName = "見込み顧客名を入力してください";
      if (!form.contactPersonName.trim()) {
        nextErrors.contactPersonName = "担当者名を入力してください";
      }
      if (form.email.trim() && !isValidEmail(form.email)) {
        nextErrors.email = "有効なメールアドレスを入力してください";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleFetch = async () => {
    const validationError = validateDemoUrlImportInput(importUrls);
    if (validationError) {
      setImportError(validationError);
      return;
    }
    setImportError(null);
    setImportLoading(true);
    try {
      const result = await fetchDemoImportFromUrls(importUrls);
      setImportResult(result);
      setPhotoAssignment(emptyPhotoAssignment());
      setStep("import");
    } catch (e) {
      setImportError(
        e instanceof Error ? e.message : "情報の取得に失敗しました"
      );
    } finally {
      setImportLoading(false);
    }
  };

  const applyImportAndContinue = () => {
    if (!importResult) return;
    setForm(applyImportToForm(importResult, photoAssignment, form));
    setSlugTouched(false);
    setStep(1);
  };

  const handleNext = () => {
    if (step === "import") return;
    if (!validateStep(step)) return;
    if (step < 3) setStep((step + 1) as FlowStep);
  };

  const handleBack = () => {
    if (step === "import") {
      setStep(0);
      return;
    }
    if (step === 1) {
      setStep(importResult ? "import" : 0);
      return;
    }
    if (step > 1) setStep((step - 1) as FlowStep);
  };

  const handleSubmit = () => {
    if (!validateStep(3)) return;
    const payload = syncFormContent({
      ...form,
      storeSlug: normalizeSlug(form.storeSlug),
    });
    const result = addDemoSite(payload);
    setCompleted(result);
  };

  const copyText = async (type: "sales" | "customer") => {
    if (!completed) return;
    const text =
      type === "sales" ? completed.salesUrlText : completed.customerProposalText;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const stepIndicator = (s: (typeof STEPS)[number]) => {
    const numericStep = step === "import" ? 0 : step;
    const isActive = s.id === numericStep || (step === "import" && s.id === 0);
    const isDone = typeof s.id === "number" && s.id < numericStep;
    return (
      <li
        key={String(s.id)}
        className={`admin-contract-step${isActive ? " admin-contract-step--active" : ""}${
          isDone ? " admin-contract-step--done" : ""
        }`}
      >
        <span className="admin-contract-step-index">{s.id === 0 ? "URL" : s.id}</span>
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
              {completed ? "デモサイト作成完了" : "デモサイト作成"}
            </h2>
            {!completed && (
              <p className="admin-modal-message">
                URLから店舗情報を取得し、5分で営業用デモHPを作成できます。
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
            <ol className="admin-contract-steps" aria-label="入力ステップ">
              {STEPS.map(stepIndicator)}
            </ol>

            {step === 0 && (
              <DemoUrlImportStep
                urls={importUrls}
                onChange={setImportUrls}
                loading={importLoading}
                error={importError}
                onFetch={handleFetch}
                onSkip={() => setStep(1)}
              />
            )}

            {step === "import" && importResult && (
              <>
                <DemoImportReviewPanel result={importResult} />
                <DemoPhotoAssignmentPanel
                  photos={importResult.photos}
                  photoStats={importResult.photoStats}
                  assignment={photoAssignment}
                  onChange={setPhotoAssignment}
                />
                <div className="admin-import-continue-actions">
                  <button
                    type="button"
                    className="admin-btn admin-btn--secondary"
                    onClick={() => setStep(0)}
                  >
                    URLを変更
                  </button>
                  <button
                    type="button"
                    className="admin-btn admin-btn--primary"
                    onClick={applyImportAndContinue}
                  >
                    この内容で次へ
                  </button>
                </div>
              </>
            )}

            {step === 1 && (
              <div className="admin-form-grid">
                {form.content ? (
                  <p className="admin-form-group admin-form-group--full admin-import-applied-note">
                    URLから取得した情報を反映済みです。必要に応じて編集してください。
                  </p>
                ) : null}
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="demo-store-name">
                    店舗名 <span className="admin-form-required">*</span>
                  </label>
                  <input
                    id="demo-store-name"
                    className="admin-form-input"
                    value={form.storeName}
                    onChange={(e) => updateField("storeName", e.target.value)}
                    placeholder="例：宵月 銀座店"
                    autoFocus
                  />
                  {errors.storeName && (
                    <p className="admin-form-error">{errors.storeName}</p>
                  )}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="demo-store-slug">
                    店舗slug <span className="admin-form-required">*</span>
                  </label>
                  <input
                    id="demo-store-slug"
                    className="admin-form-input admin-form-input--mono"
                    value={form.storeSlug}
                    onChange={(e) => {
                      setSlugTouched(true);
                      updateField("storeSlug", normalizeSlug(e.target.value));
                    }}
                    placeholder="例：shogetsu-ginza"
                  />
                  <p className="admin-form-hint">デモURL: /{form.storeSlug || "your-slug"}</p>
                  {errors.storeSlug && (
                    <p className="admin-form-error">{errors.storeSlug}</p>
                  )}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="demo-business-type">
                    業態
                  </label>
                  <select
                    id="demo-business-type"
                    className="admin-form-select"
                    value={form.businessType}
                    onChange={(e) =>
                      updateField("businessType", e.target.value as BusinessType)
                    }
                  >
                    {BUSINESS_TYPE_OPTIONS.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="demo-source-url">
                    店舗URL
                  </label>
                  <input
                    id="demo-source-url"
                    type="url"
                    className="admin-form-input"
                    value={form.sourceUrl}
                    onChange={(e) => updateField("sourceUrl", e.target.value)}
                    placeholder="食べログ、Instagram、公式サイトなど"
                  />
                </div>
                <div className="admin-form-group admin-form-group--full">
                  <label className="admin-form-label" htmlFor="demo-address">
                    住所（任意）
                  </label>
                  <input
                    id="demo-address"
                    className="admin-form-input"
                    value={form.address}
                    onChange={(e) => updateField("address", e.target.value)}
                    placeholder="東京都中央区..."
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="demo-phone-step1">
                    電話番号
                  </label>
                  <input
                    id="demo-phone-step1"
                    type="tel"
                    className="admin-form-input"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="03-1234-5678"
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="admin-template-grid">
                <p className="admin-template-grid-lead">
                  提案イメージに合うテンプレートを選択してください。
                </p>
                {CONTRACT_TEMPLATE_OPTIONS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`admin-template-card${
                      form.templateId === t.id ? " admin-template-card--selected" : ""
                    }`}
                    onClick={() => updateField("templateId", t.id as ContractTemplateId)}
                  >
                    <span className="admin-template-card-name">{t.label}</span>
                    <span className="admin-template-card-hint">PC・スマホ対応</span>
                  </button>
                ))}
              </div>
            )}

            {step === 3 && (
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="demo-prospect">
                    見込み顧客名 <span className="admin-form-required">*</span>
                  </label>
                  <input
                    id="demo-prospect"
                    className="admin-form-input"
                    value={form.prospectName}
                    onChange={(e) => updateField("prospectName", e.target.value)}
                    placeholder="例：株式会社〇〇"
                    autoFocus
                  />
                  {errors.prospectName && (
                    <p className="admin-form-error">{errors.prospectName}</p>
                  )}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="demo-contact">
                    担当者名 <span className="admin-form-required">*</span>
                  </label>
                  <input
                    id="demo-contact"
                    className="admin-form-input"
                    value={form.contactPersonName}
                    onChange={(e) => updateField("contactPersonName", e.target.value)}
                    placeholder="例：山田 太郎"
                  />
                  {errors.contactPersonName && (
                    <p className="admin-form-error">{errors.contactPersonName}</p>
                  )}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="demo-phone">
                    電話番号
                  </label>
                  <input
                    id="demo-phone"
                    type="tel"
                    className="admin-form-input"
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="03-1234-5678"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="demo-email">
                    メールアドレス
                  </label>
                  <input
                    id="demo-email"
                    type="email"
                    className="admin-form-input"
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="contact@example.com"
                  />
                  {errors.email && <p className="admin-form-error">{errors.email}</p>}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label" htmlFor="demo-sales-status">
                    営業ステータス
                  </label>
                  <select
                    id="demo-sales-status"
                    className="admin-form-select"
                    value={form.salesStatus}
                    onChange={(e) =>
                      updateField("salesStatus", e.target.value as SalesStatus)
                    }
                  >
                    {SALES_STATUS_OPTIONS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group admin-form-group--full">
                  <label className="admin-form-label" htmlFor="demo-sales-memo">
                    営業メモ
                  </label>
                  <textarea
                    id="demo-sales-memo"
                    className="admin-form-textarea"
                    rows={4}
                    value={form.salesMemo}
                    onChange={(e) => updateField("salesMemo", e.target.value)}
                    placeholder="提案背景、競合状況、次回アクションなど"
                  />
                </div>
              </div>
            )}

            {step !== "import" && (
              <div className="admin-modal-actions admin-modal-actions--contract">
                <button
                  type="button"
                  className="admin-btn admin-btn--secondary"
                  onClick={handleClose}
                >
                  キャンセル
                </button>
                <div className="admin-contract-modal-nav">
                  {step > 0 && step !== 0 && (
                    <button
                      type="button"
                      className="admin-btn admin-btn--secondary"
                      onClick={handleBack}
                    >
                      戻る
                    </button>
                  )}
                  {step === 0 ? null : step < 3 ? (
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
                      className="admin-btn admin-btn--primary"
                      onClick={handleSubmit}
                    >
                      デモサイトを作成
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="admin-contract-success">
              <div className="admin-contract-success-icon" aria-hidden>
                <Check size={22} strokeWidth={2} />
              </div>
              <p className="admin-contract-success-lead">
                <strong>{completed.storeName}</strong> のデモサイトを作成しました。
              </p>
            </div>

            <dl className="admin-contract-result-list">
              <div>
                <dt>デモサイトURL</dt>
                <dd>
                  <a href={completed.demoUrl} target="_blank" rel="noopener noreferrer">
                    {completed.demoUrl}
                  </a>
                </dd>
              </div>
              <div>
                <dt>管理用URL</dt>
                <dd>
                  <a href={completed.adminUrl} target="_blank" rel="noopener noreferrer">
                    {completed.adminUrl}
                  </a>
                </dd>
              </div>
              <div>
                <dt>店舗名</dt>
                <dd>{completed.storeName}</dd>
              </div>
              <div>
                <dt>テンプレート</dt>
                <dd>{completed.templateLabel}</dd>
              </div>
              <div>
                <dt>営業ステータス</dt>
                <dd>{completed.salesStatusLabel}</dd>
              </div>
              <div>
                <dt>作成日</dt>
                <dd>{formatDate(completed.createdAt)}</dd>
              </div>
            </dl>

            <div className="admin-contract-result-actions">
              <a
                href={completed.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn admin-btn--secondary"
              >
                <ExternalLink size={14} strokeWidth={1.75} />
                デモサイトを見る
              </a>
              <a href={completed.adminUrl} className="admin-btn admin-btn--secondary">
                管理画面を開く
              </a>
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => copyText("sales")}
              >
                <Copy size={14} strokeWidth={1.75} />
                {copied === "sales" ? "コピーしました" : "営業用URLをコピー"}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--secondary"
                onClick={() => copyText("customer")}
              >
                <Copy size={14} strokeWidth={1.75} />
                {copied === "customer" ? "コピーしました" : "顧客へ送る文面をコピー"}
              </button>
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={() => {
                  handleClose();
                  onRequestConvert(completed.demoSiteId);
                }}
              >
                契約へ切り替える
              </button>
            </div>

            <div className="admin-modal-actions admin-modal-actions--contract">
              <button
                type="button"
                className="admin-btn admin-btn--primary"
                onClick={handleClose}
              >
                一覧に戻る
              </button>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
