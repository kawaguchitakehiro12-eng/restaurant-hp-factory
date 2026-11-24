import type {DemoUrlImportInput,DemoUrlImportResult} from "@/types/demo-url-import";
import type {PartialImportData} from "@/lib/admin/demo-url-import/parsers";
import {crawlInstagram,crawlOfficialSite,crawlTabelogProgressive} from "@/lib/admin/demo-url-import/source-crawlers";
import {mergePartial,buildExtractedFields,buildImportResult,countPhotosBySource,type DemoImportStreamEvent} from "@/lib/admin/demo-url-import/import-result";
export type {DemoImportStreamEvent} from "@/lib/admin/demo-url-import/import-result";
/** サーバー側: URLから取得できる情報のみマージ（AI不使用） */
export async function importDemoFromUrls(
  input: DemoUrlImportInput
): Promise<DemoUrlImportResult> {
  let result: DemoUrlImportResult | null = null;
  await importDemoFromUrlsStreaming(input, (event) => {
    if (event.type === "complete") result = event.result;
    if (event.type === "error") throw new Error(event.message);
  });
  if (!result) throw new Error("情報の取得に失敗しました");
  return result;
}

/** 段階的に取得結果を送出 */
export async function importDemoFromUrlsStreaming(
  input: DemoUrlImportInput,
  emit: (event: DemoImportStreamEvent) => void
): Promise<void> {
  const merged: PartialImportData = {
    menus: [],
    photos: [],
    notes: [],
  };

  const tabelog = input.tabelogUrl.trim();
  const instagram = input.instagramUrl.trim();
  const official = input.officialUrl?.trim() ?? "";

  try {
    if (tabelog) {
      emit({ type: "phase", message: "店舗情報を取得しています…" });
      await crawlTabelogProgressive(tabelog, (partial, phase) => {
        mergePartial(merged, partial);
        emit({ type: "partial", phase, data: partial });
      });
    }

    const secondaryTasks: Promise<void>[] = [];

    if (official) {
      secondaryTasks.push(
        crawlOfficialSite(official).then((data) => {
          mergePartial(merged, { ...data, officialUrl: official });
          if (data.photos?.length) {
            emit({
              type: "partial",
              phase: "photos-more",
              data: { photos: data.photos },
            });
          }
        })
      );
    }

    if (instagram) {
      secondaryTasks.push(
        crawlInstagram(instagram).then((data) => {
          mergePartial(merged, { ...data, instagramUrl: instagram });
          if (data.photos?.length) {
            emit({
              type: "partial",
              phase: "photos-more",
              data: { photos: data.photos },
            });
          }
        })
      );
    }

    if (secondaryTasks.length > 0) {
      emit({ type: "phase", message: "Instagram・公式サイトの写真を取得中…" });
      await Promise.all(secondaryTasks);
    }

    const extractedFields = buildExtractedFields(merged);
    if (extractedFields.length === 0) {
      merged.notes?.push(
        "取得できた情報がありませんでした。URLを確認するか、手入力で作成してください。"
      );
    }

    const photoStats = countPhotosBySource(merged.photos ?? []);
    merged.notes?.push(
      `合計 ${photoStats.total}枚取得（食べログ ${photoStats.tabelog} / Instagram ${photoStats.instagram} / 公式 ${photoStats.official}）`
    );

    const result = buildImportResult(merged, input, "complete");
    emit({ type: "complete", result });
  } catch (e) {
    emit({
      type: "error",
      message: e instanceof Error ? e.message : "情報の取得中にエラーが発生しました",
    });
  }
}

