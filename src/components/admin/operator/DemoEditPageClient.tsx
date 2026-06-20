"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/admin/PageHeader";
import { DemoPhotosEditor, type PhotoEditorPayload } from "@/components/admin/DemoPhotosEditor";
import { ImageUploadField } from "@/components/admin/ImageUploadField";
import { useAdminUi } from "@/components/admin/AdminUiProvider";
import { useOperatorAdmin } from "@/components/admin/operator/OperatorAdminProvider";
import { SALES_STATUS_OPTIONS } from "@/lib/admin/demo-labels";
import { buildDemoUrl } from "@/lib/admin/demo-create";
import { normalizeSlug, todayIso } from "@/lib/admin/form-utils";
import { getTemplateLabel } from "@/lib/admin/contract-templates";
import { buildPhotoLibrary } from "@/lib/admin/demo-photo-library";
import { createEmptyMenuItem, createEmptyTopic } from "@/lib/stores/demo-samples";
import type { DemoSite } from "@/types/demo";
import type { DemoMenuItem, DemoSiteContent, DemoTopicItem } from "@/types/demo-content";
import { ensureDemoContent } from "@/types/demo-content";

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="admin-edit-section">
      <div className="admin-edit-section-head">
        <h2>{title}</h2>
        {description ? <p>{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function DemoEditPageClient() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { getDemoSiteBySlug, saveDemoSite, isSlugTaken } = useOperatorAdmin();
  const { showToast, setDirty } = useAdminUi();

  const source = getDemoSiteBySlug(slug);
  const [draft, setDraft] = useState<DemoSite | null>(null);
  const syncKeyRef = useRef<string | null>(null);
  const sourceSyncKey = source ? `${source.id}:${source.lastUpdatedAt}` : null;

  useEffect(() => {
    if (!source || !sourceSyncKey) return;
    if (syncKeyRef.current === sourceSyncKey) return;
    syncKeyRef.current = sourceSyncKey;
    setDraft({
      ...source,
      content: ensureDemoContent(source.content),
    });
    setDirty(false);
  }, [source, sourceSyncKey, setDirty]);

  if (!source || !draft) {
    return (
      <div className="admin-edit-empty">
        <p>デモサイトが見つかりません。</p>
        <Link href="/admin/stores" className="admin-btn admin-btn--secondary">
          一覧に戻る
        </Link>
      </div>
    );
  }

  const content = ensureDemoContent(draft.content);
  const isCafe = draft.templateType === "cafe";
  const demoUrl = buildDemoUrl(draft.storeSlug);

  const patchContent = (patch: Partial<DemoSiteContent>) => {
    setDirty(true);
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            content: {
              ...ensureDemoContent(prev.content),
              ...patch,
              basicInfo: patch.basicInfo
                ? { ...ensureDemoContent(prev.content).basicInfo, ...patch.basicInfo }
                : ensureDemoContent(prev.content).basicInfo,
              photos: patch.photos
                ? { ...ensureDemoContent(prev.content).photos, ...patch.photos }
                : ensureDemoContent(prev.content).photos,
            },
          }
        : prev
    );
  };

  const patchBasic = (key: keyof DemoSiteContent["basicInfo"], value: string) => {
    patchContent({ basicInfo: { ...content.basicInfo, [key]: value } });
  };

  const patchPhotoContent = (payload: PhotoEditorPayload) => {
    setDirty(true);
    setDraft((prev) =>
      prev
        ? {
            ...prev,
            content: {
              ...ensureDemoContent(prev.content),
              photos: payload.photos,
              importedPhotos:
                payload.importedPhotos ??
                ensureDemoContent(prev.content).importedPhotos,
            },
          }
        : prev
    );
  };

  const photoLibrary = buildPhotoLibrary(
    content.photos,
    content.importedPhotos ?? []
  );

  const patchSales = (patch: Partial<DemoSite>) => {
    setDirty(true);
    setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
  };

  const updateMenu = (id: string, patch: Partial<DemoMenuItem>) => {
    patchContent({
      menus: content.menus.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    });
  };

  const updateTopic = (id: string, patch: Partial<DemoTopicItem>) => {
    patchContent({
      topics: content.topics.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    });
  };

  const handleSave = () => {
    const normalizedSlug = normalizeSlug(draft.storeSlug);
    if (isSlugTaken(normalizedSlug, draft.id)) {
      window.alert("このslugは既に使用されています");
      return;
    }
    const saved: DemoSite = {
      ...draft,
      storeSlug: normalizedSlug,
      address: ensureDemoContent(draft.content).basicInfo.address || draft.address,
      phone: ensureDemoContent(draft.content).basicInfo.phone || draft.phone,
      content: ensureDemoContent(draft.content),
      lastUpdatedAt: todayIso(),
    };
    saveDemoSite(saved);
    setDirty(false);
    showToast("保存しました", "デモサイトに反映されました。");
    if (normalizedSlug !== slug) {
      router.replace(`/admin/demo/${normalizedSlug}/edit`);
    }
  };

  return (
    <>
      <div className="admin-edit-page pb-24">
      <PageHeader
        title={`${draft.storeName} — デモ編集`}
        description={`テンプレート: ${getTemplateLabel(draft.templateId)} / slug: ${draft.storeSlug}`}
        action={
          <a
            href={demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn--secondary"
          >
            <ExternalLink size={14} strokeWidth={1.75} />
            デモサイトを見る
          </a>
        }
      />

      <SectionCard title="店舗基本情報" description="公開サイトに表示される基本情報">
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label className="admin-form-label">店舗名</label>
            <input
              className="admin-form-input"
              value={draft.storeName}
              onChange={(e) => patchSales({ storeName: e.target.value })}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">slug</label>
            <input
              className="admin-form-input admin-form-input--mono"
              value={draft.storeSlug}
              onChange={(e) => patchSales({ storeSlug: normalizeSlug(e.target.value) })}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">英字表記</label>
            <input
              className="admin-form-input"
              value={content.basicInfo.nameEn}
              onChange={(e) => patchBasic("nameEn", e.target.value)}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">キャッチコピー</label>
            <input
              className="admin-form-input"
              value={content.basicInfo.catchCopy}
              onChange={(e) => patchBasic("catchCopy", e.target.value)}
            />
          </div>
          {isCafe ? (
            <div className="admin-form-group admin-form-group--full">
              <label className="admin-form-label">サブコピー</label>
              <input
                className="admin-form-input"
                value={content.basicInfo.subCopy}
                onChange={(e) => patchBasic("subCopy", e.target.value)}
              />
            </div>
          ) : (
            <div className="admin-form-group admin-form-group--full">
              <label className="admin-form-label">サブコピー（1行ずつ）</label>
              <textarea
                className="admin-form-textarea"
                rows={3}
                value={content.basicInfo.subCopyLines.join("\n")}
                onChange={(e) =>
                  patchContent({
                    basicInfo: {
                      ...content.basicInfo,
                      subCopyLines: e.target.value.split("\n"),
                    },
                  })
                }
              />
            </div>
          )}
          <div className="admin-form-group admin-form-group--full">
            <label className="admin-form-label">コンセプト</label>
            <textarea
              className="admin-form-textarea"
              rows={3}
              value={content.basicInfo.concept}
              onChange={(e) => patchBasic("concept", e.target.value)}
            />
          </div>
          <div className="admin-form-group admin-form-group--full">
            <label className="admin-form-label">住所</label>
            <input
              className="admin-form-input"
              value={content.basicInfo.address}
              onChange={(e) => patchBasic("address", e.target.value)}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">電話番号</label>
            <input
              className="admin-form-input"
              value={content.basicInfo.phone}
              onChange={(e) => patchBasic("phone", e.target.value)}
            />
          </div>
          {isCafe ? (
            <>
              <div className="admin-form-group">
                <label className="admin-form-label">平日営業時間</label>
                <input
                  className="admin-form-input"
                  value={content.basicInfo.weekdayHours}
                  onChange={(e) => patchBasic("weekdayHours", e.target.value)}
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">土日営業時間</label>
                <input
                  className="admin-form-input"
                  value={content.basicInfo.weekendHours}
                  onChange={(e) => patchBasic("weekendHours", e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="admin-form-group">
              <label className="admin-form-label">営業時間</label>
              <input
                className="admin-form-input"
                value={content.basicInfo.businessHours}
                onChange={(e) => patchBasic("businessHours", e.target.value)}
              />
            </div>
          )}
          <div className="admin-form-group">
            <label className="admin-form-label">定休日</label>
            <input
              className="admin-form-input"
              value={content.basicInfo.closedDays}
              onChange={(e) => patchBasic("closedDays", e.target.value)}
            />
          </div>
          <div className="admin-form-group admin-form-group--full">
            <label className="admin-form-label">アクセス</label>
            <input
              className="admin-form-input"
              value={content.basicInfo.access}
              onChange={(e) => patchBasic("access", e.target.value)}
            />
          </div>
          <div className="admin-form-group admin-form-group--full">
            <label className="admin-form-label">Google Map URL</label>
            <input
              className="admin-form-input"
              value={content.basicInfo.mapEmbedUrl}
              onChange={(e) => patchBasic("mapEmbedUrl", e.target.value)}
              placeholder="https://www.google.com/maps/embed?..."
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">Instagram URL</label>
            <input
              className="admin-form-input"
              value={content.basicInfo.instagramUrl}
              onChange={(e) => patchBasic("instagramUrl", e.target.value)}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">予約URL</label>
            <input
              className="admin-form-input"
              value={content.basicInfo.reservationUrl}
              onChange={(e) => patchBasic("reservationUrl", e.target.value)}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="写真"
        description="取得写真の割り当て・画像アップロード（未登録はサンプル表示）"
      >
        <DemoPhotosEditor
          photos={content.photos}
          importedPhotos={photoLibrary}
          onChange={patchPhotoContent}
          showSaveBar={false}
          showAssignmentPanel={photoLibrary.length > 0}
        />
      </SectionCard>

      <SectionCard title="メニュー">
        <div className="admin-edit-list">
          {content.menus.map((menu) => (
            <div key={menu.id} className="admin-edit-list-item">
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="admin-form-label">メニュー名</label>
                  <input
                    className="admin-form-input"
                    value={menu.name}
                    onChange={(e) => updateMenu(menu.id, { name: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">価格</label>
                  <input
                    className="admin-form-input"
                    value={menu.price}
                    onChange={(e) => updateMenu(menu.id, { price: e.target.value })}
                  />
                </div>
                <div className="admin-form-group admin-form-group--full">
                  <label className="admin-form-label">説明文</label>
                  <input
                    className="admin-form-input"
                    value={menu.description}
                    onChange={(e) => updateMenu(menu.id, { description: e.target.value })}
                  />
                </div>
                <div className="admin-form-group admin-form-group--full">
                  <ImageUploadField
                    label="メニュー写真"
                    value={menu.imageUrl}
                    onChange={(value) => updateMenu(menu.id, { imageUrl: value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    <input
                      type="checkbox"
                      checked={menu.visible}
                      onChange={(e) => updateMenu(menu.id, { visible: e.target.checked })}
                    />{" "}
                    表示
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--secondary mt-3"
          onClick={() =>
            patchContent({
              menus: [...content.menus, createEmptyMenuItem(content.menus.length + 1)],
            })
          }
        >
          + メニューを追加
        </button>
      </SectionCard>

      <SectionCard title="トピックス">
        <div className="admin-edit-list">
          {content.topics.map((topic) => (
            <div key={topic.id} className="admin-edit-list-item">
              <div className="admin-form-grid">
                <div className="admin-form-group">
                  <label className="admin-form-label">日付</label>
                  <input
                    className="admin-form-input"
                    value={topic.date}
                    onChange={(e) => updateTopic(topic.id, { date: e.target.value })}
                    placeholder="2026.06"
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">タイトル</label>
                  <input
                    className="admin-form-input"
                    value={topic.title}
                    onChange={(e) => updateTopic(topic.id, { title: e.target.value })}
                  />
                </div>
                <div className="admin-form-group admin-form-group--full">
                  <label className="admin-form-label">本文</label>
                  <textarea
                    className="admin-form-textarea"
                    rows={2}
                    value={topic.body}
                    onChange={(e) => updateTopic(topic.id, { body: e.target.value })}
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">
                    <input
                      type="checkbox"
                      checked={topic.visible}
                      onChange={(e) => updateTopic(topic.id, { visible: e.target.checked })}
                    />{" "}
                    表示
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="admin-btn admin-btn--secondary mt-3"
          onClick={() => patchContent({ topics: [...content.topics, createEmptyTopic()] })}
        >
          + トピックスを追加
        </button>
      </SectionCard>

      <SectionCard title="営業管理">
        <div className="admin-form-grid">
          <div className="admin-form-group">
            <label className="admin-form-label">見込み顧客名</label>
            <input
              className="admin-form-input"
              value={draft.prospectName}
              onChange={(e) => patchSales({ prospectName: e.target.value })}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">担当者名</label>
            <input
              className="admin-form-input"
              value={draft.contactPersonName}
              onChange={(e) => patchSales({ contactPersonName: e.target.value })}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">電話番号</label>
            <input
              className="admin-form-input"
              value={draft.phone}
              onChange={(e) => patchSales({ phone: e.target.value })}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">メールアドレス</label>
            <input
              className="admin-form-input"
              type="email"
              value={draft.email}
              onChange={(e) => patchSales({ email: e.target.value })}
            />
          </div>
          <div className="admin-form-group">
            <label className="admin-form-label">営業ステータス</label>
            <select
              className="admin-form-select"
              value={draft.salesStatus}
              onChange={(e) =>
                patchSales({ salesStatus: e.target.value as DemoSite["salesStatus"] })
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
            <label className="admin-form-label">営業メモ</label>
            <textarea
              className="admin-form-textarea"
              rows={4}
              value={draft.salesMemo}
              onChange={(e) => patchSales({ salesMemo: e.target.value })}
            />
          </div>
        </div>
      </SectionCard>

      <div className="admin-save-bar admin-save-bar--fixed admin-save-bar--demo-edit">
        <a
          href={demoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="admin-btn admin-btn--secondary"
        >
          <ExternalLink size={14} strokeWidth={1.75} />
          デモサイトを見る
        </a>
        <button type="button" className="admin-btn admin-btn--primary" onClick={handleSave}>
          変更を保存
        </button>
      </div>
      </div>
    </>
  );
}
