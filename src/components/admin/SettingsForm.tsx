"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { DirtyForm } from "@/components/admin/DirtyForm";
import { FormField } from "@/components/admin/FormField";
import { SaveBar } from "@/components/admin/SaveBar";
import { templateTypeLabels } from "@/lib/admin/labels";
import type { StoreRecord } from "@/types/store";

type SettingsFormProps = { store: StoreRecord };

export function SettingsForm({ store }: SettingsFormProps) {
  const [optionalOpen, setOptionalOpen] = useState(false);
  const subCopy = Array.isArray(store.subCopy)
    ? store.subCopy.join("\n")
    : store.subCopy;
  const hours = store.businessHours;

  return (
    <DirtyForm className="admin-settings-form">
      <div className="admin-notice admin-notice--info">
        <div>
          <p className="font-medium">デザインはプロ品質を保つため固定です</p>
          <p className="mt-1 text-xs leading-relaxed opacity-90">
            色・レイアウト・フォントは変更できません。
            店舗情報・写真・メニューのみ更新可能です。
          </p>
        </div>
      </div>

      <div className="admin-settings-sections admin-settings-sections--compact">
        <section className="admin-card admin-settings-section">
          <div className="admin-section-head">
            <h2 className="admin-section-title">必須項目</h2>
            <span className="admin-section-badge">必須</span>
          </div>

          <FormField label="店舗名">
            <input type="text" className="admin-form-input" defaultValue={store.name} />
          </FormField>

          <FormField label="キャッチコピー" hint="例：隠れ家で味わう本格和食">
            <input
              type="text"
              className="admin-form-input"
              defaultValue={store.catchCopy}
              placeholder="隠れ家で味わう本格和食"
            />
          </FormField>

          <div className="admin-form-grid">
            <FormField label="住所">
              <input type="text" className="admin-form-input" defaultValue={store.address} />
            </FormField>
            <FormField label="電話番号">
              <input type="tel" className="admin-form-input" defaultValue={store.phone} />
            </FormField>
          </div>

          {hours.dinner && (
            <FormField label="営業時間" hint="例：17:30 – 23:00">
              <input
                type="text"
                className="admin-form-input"
                defaultValue={hours.dinner}
                placeholder="17:30 – 23:00"
              />
            </FormField>
          )}
          {hours.weekday && (
            <FormField label="平日">
              <input type="text" className="admin-form-input" defaultValue={hours.weekday} />
            </FormField>
          )}
          {hours.weekend && (
            <FormField label="土日祝">
              <input type="text" className="admin-form-input" defaultValue={hours.weekend} />
            </FormField>
          )}
          {hours.lunch && (
            <FormField label="ランチ">
              <input type="text" className="admin-form-input" defaultValue={hours.lunch} />
            </FormField>
          )}

          <FormField label="予約URL" hint="食べログ、TableCheck等の予約ページURL">
            <input
              type="url"
              className="admin-form-input"
              defaultValue={store.reservationUrl}
              id="reservation-url"
            />
          </FormField>
        </section>

        <section className="admin-card admin-settings-section">
          <h2 className="admin-section-title">その他の店舗情報</h2>
          <div className="admin-form-grid">
            <FormField label="店舗名（英字）">
              <input type="text" className="admin-form-input" defaultValue={store.nameEn} />
            </FormField>
            <FormField label="エリア">
              <input type="text" className="admin-form-input" defaultValue={store.location} />
            </FormField>
            <FormField label="テンプレート" hint="変更不可">
              <input
                type="text"
                className="admin-form-input"
                defaultValue={templateTypeLabels[store.templateType]}
                disabled
              />
            </FormField>
            <FormField label="定休日">
              <input type="text" className="admin-form-input" defaultValue={store.closedDays} />
            </FormField>
          </div>
          <FormField label="アクセス">
            <input type="text" className="admin-form-input" defaultValue={store.access} />
          </FormField>
          <FormField label="サブコピー" hint="例：季節の食材を丁寧に仕立てる小さな名店">
            <textarea
              className="admin-form-textarea"
              defaultValue={subCopy}
              rows={2}
              placeholder="季節の食材を丁寧に仕立てる小さな名店"
            />
          </FormField>
          <FormField label="コンセプト">
            <textarea
              className="admin-form-textarea"
              defaultValue={store.concept}
              rows={2}
            />
          </FormField>
        </section>

        <section className="admin-card admin-settings-section admin-collapsible">
          <button
            type="button"
            className="admin-collapsible-trigger"
            onClick={() => setOptionalOpen((v) => !v)}
            aria-expanded={optionalOpen}
          >
            <span>詳細設定（任意）</span>
            <ChevronDown
              size={16}
              strokeWidth={1.75}
              className={optionalOpen ? "admin-collapsible-icon--open" : ""}
            />
          </button>
          {optionalOpen && (
            <div className="admin-collapsible-body">
              <FormField label="Instagram URL">
                <input
                  type="url"
                  className="admin-form-input"
                  defaultValue={store.instagramUrl ?? ""}
                  placeholder="https://instagram.com/..."
                />
              </FormField>
              <FormField label="Instagram ハンドル">
                <input
                  type="text"
                  className="admin-form-input"
                  defaultValue={store.instagramHandle ?? ""}
                  placeholder="@username"
                />
              </FormField>
              <FormField label="検索用キーワード">
                <input
                  type="text"
                  className="admin-form-input"
                  placeholder="例：西麻布 居酒屋 個室"
                />
              </FormField>
              <FormField label="補足メモ" hint="運営への連絡事項（サイトには表示されません）">
                <textarea
                  className="admin-form-textarea"
                  rows={2}
                  placeholder="特記事項があればご記入ください"
                />
              </FormField>
            </div>
          )}
        </section>
      </div>

      <SaveBar />
    </DirtyForm>
  );
}
