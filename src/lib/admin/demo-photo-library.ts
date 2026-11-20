import { generateId } from "@/lib/admin/form-utils";
import type { DemoGalleryPhoto, DemoPhotos, DemoSiteContent } from "@/types/demo-content";
import type {
  DemoImportedPhoto,
  DemoPhotoAssignment,
  DemoPhotoStats,
} from "@/types/demo-url-import";
import { emptyPhotoAssignment } from "@/types/demo-url-import";
import type { StorePhoto, StoreRecord } from "@/types/store";
import { getPhotoByRole, getPhotosByRole } from "@/lib/stores/helpers";

function urlPhotoId(url: string): string {
  return `lib-${url.slice(-24).replace(/[^a-zA-Z0-9]/g, "")}-${url.length}`;
}

function slotLabel(slot: keyof Omit<DemoPhotos, "gallery" | "heroFit" | "heroObjectPosition">): string {
  const labels = {
    hero: "ファーストビュー",
    interior: "店内",
    food: "料理",
    exterior: "外観",
  } as const;
  return labels[slot];
}

export function dedupeImportedPhotos(photos: DemoImportedPhoto[]): DemoImportedPhoto[] {
  const seen = new Set<string>();
  return photos.filter((photo) => {
    if (seen.has(photo.url)) return false;
    seen.add(photo.url);
    return true;
  });
}

/** スロットURLとライブラリから写真一覧を構築 */
export function buildPhotoLibrary(
  photos: DemoPhotos,
  importedPhotos: DemoImportedPhoto[] = []
): DemoImportedPhoto[] {
  const library = dedupeImportedPhotos([...importedPhotos]);
  const byUrl = new Map(library.map((p) => [p.url, p]));

  const addUrl = (url: string, alt: string) => {
    if (!url.trim()) return;
    if (byUrl.has(url)) return;
    const item: DemoImportedPhoto = {
      id: urlPhotoId(url),
      url,
      alt,
      source: "upload",
    };
    library.push(item);
    byUrl.set(url, item);
  };

  addUrl(photos.hero, slotLabel("hero"));
  addUrl(photos.interior, slotLabel("interior"));
  addUrl(photos.food, slotLabel("food"));
  addUrl(photos.exterior, slotLabel("exterior"));
  photos.gallery.forEach((g, i) => addUrl(g.url, g.alt || `ギャラリー ${i + 1}`));

  return library;
}

export function photoStatsFromLibrary(photos: DemoImportedPhoto[]): DemoPhotoStats {
  return {
    tabelog: photos.filter((p) => p.source === "tabelog").length,
    instagram: photos.filter((p) => p.source === "instagram").length,
    official: photos.filter((p) => p.source === "official").length,
    total: photos.length,
  };
}

export function photosToAssignment(
  photos: DemoPhotos,
  library: DemoImportedPhoto[]
): DemoPhotoAssignment {
  const byUrl = new Map(library.map((p) => [p.url, p.id]));
  const idFor = (url: string) => (url.trim() ? byUrl.get(url) ?? null : null);

  return {
    hero: idFor(photos.hero),
    interior: idFor(photos.interior),
    food: idFor(photos.food),
    exterior: idFor(photos.exterior),
    gallery: photos.gallery
      .map((g) => byUrl.get(g.url))
      .filter((id): id is string => Boolean(id)),
  };
}

export function applyAssignmentToPhotos(
  assignment: DemoPhotoAssignment,
  library: DemoImportedPhoto[],
  current: DemoPhotos
): DemoPhotos {
  const byId = new Map(library.map((p) => [p.id, p]));
  const urlFor = (id: string | null) => (id ? byId.get(id)?.url ?? "" : "");

  const gallery: DemoGalleryPhoto[] = assignment.gallery
    .map((id, index) => {
      const photo = byId.get(id);
      if (!photo) return null;
      const existing = current.gallery.find((g) => g.url === photo.url);
      return {
        id: existing?.id ?? generateId("gallery"),
        url: photo.url,
        alt: existing?.alt || photo.alt,
        caption: existing?.caption ?? "",
        sortOrder: index + 1,
      };
    })
    .filter((g): g is DemoGalleryPhoto => g !== null);

  return {
    ...current,
    hero: urlFor(assignment.hero),
    interior: urlFor(assignment.interior),
    food: urlFor(assignment.food),
    exterior: urlFor(assignment.exterior),
    gallery,
  };
}

export function ensureLibraryHasUrl(
  library: DemoImportedPhoto[],
  url: string,
  alt: string
): DemoImportedPhoto[] {
  if (!url.trim()) return library;
  if (library.some((p) => p.url === url)) return library;
  return [
    ...library,
    {
      id: generateId("photo"),
      url,
      alt,
      source: "upload",
    },
  ];
}

/** StoreRecord から編集用 DemoPhotos を生成（契約店舗向け） */
export function storeRecordToDemoPhotos(store: StoreRecord): DemoPhotos {
  const hero = getPhotoByRole(store, "hero");
  const interior = getPhotoByRole(store, "interior") ?? getPhotoByRole(store, "about");
  const food = getPhotoByRole(store, "food");
  const exterior = getPhotoByRole(store, "exterior");
  const galleryPhotos = getPhotosByRole(store, "gallery");

  return {
    hero: hero?.url ?? "",
    interior: interior?.url ?? "",
    food: food?.url ?? "",
    exterior: exterior?.url ?? "",
    gallery: galleryPhotos.map((photo, index) => ({
      id: photo.id,
      url: photo.url,
      alt: photo.alt,
      caption: photo.caption ?? "",
      sortOrder: index + 1,
    })),
  };
}

export function mergeStoreWithPhotoContent(
  base: StoreRecord,
  photos: DemoPhotos,
  storeName: string
): StoreRecord {
  const basePhotos = storeRecordToDemoPhotos(base);
  const effective: DemoPhotos = {
    hero: photos.hero.trim() || basePhotos.hero,
    interior: photos.interior.trim() || basePhotos.interior,
    food: photos.food.trim() || basePhotos.food,
    exterior: photos.exterior.trim() || basePhotos.exterior,
    gallery: photos.gallery.length > 0 ? photos.gallery : basePhotos.gallery,
    heroFit: photos.heroFit,
    heroObjectPosition: photos.heroObjectPosition,
  };

  const nextPhotos: StorePhoto[] = [];
  const pushPhoto = (
    id: string,
    sortOrder: number,
    role: StorePhoto["role"],
    url: string,
    alt: string
  ) => {
    if (!url.trim()) return;
    nextPhotos.push({ id, sortOrder, role, url, alt });
  };

  const templateType = base.templateType;

  pushPhoto("photo-hero", 1, "hero", effective.hero, `${storeName} ファーストビュー`);
  pushPhoto(
    "photo-about",
    2,
    templateType === "cafe" ? "concept" : "about",
    effective.interior,
    `${storeName} 店内`
  );
  pushPhoto("photo-interior", 3, "interior", effective.interior, `${storeName} 店内`);
  pushPhoto("photo-food", 4, "food", effective.food, `${storeName} 料理`);
  pushPhoto("photo-exterior", 5, "exterior", effective.exterior, `${storeName} 外観`);

  effective.gallery.forEach((g, i) => {
    if (!g.url.trim()) return;
    nextPhotos.push({
      id: g.id || `photo-gallery-${i + 1}`,
      sortOrder: 6 + i,
      role: "gallery",
      url: g.url.trim(),
      alt: g.alt.trim() || `${storeName} ギャラリー`,
      caption: g.caption.trim() || undefined,
    });
  });

  return { ...base, photos: nextPhotos.length > 0 ? nextPhotos : base.photos };
}

export type PhotoEditorState = {
  photos: DemoPhotos;
  importedPhotos: DemoImportedPhoto[];
};

export function initPhotoEditorState(content: DemoSiteContent): PhotoEditorState {
  const photos = content.photos;
  const importedPhotos = buildPhotoLibrary(photos, content.importedPhotos ?? []);
  return { photos, importedPhotos };
}

export function initPhotoEditorFromStore(store: StoreRecord): PhotoEditorState {
  const photos = storeRecordToDemoPhotos(store);
  return {
    photos,
    importedPhotos: buildPhotoLibrary(photos, []),
  };
}

export function syncAssignment(
  assignment: DemoPhotoAssignment,
  library: DemoImportedPhoto[],
  current: DemoPhotos
): PhotoEditorState {
  const photos = applyAssignmentToPhotos(assignment, library, current);
  return { photos, importedPhotos: library };
}

export function syncSlotUpload(
  slot: keyof Omit<DemoPhotos, "gallery" | "heroFit" | "heroObjectPosition">,
  url: string,
  state: PhotoEditorState
): PhotoEditorState {
  const importedPhotos = ensureLibraryHasUrl(
    state.importedPhotos,
    url,
    slotLabel(slot)
  );
  const photos = { ...state.photos, [slot]: url };
  return { photos, importedPhotos };
}

export function emptyAssignment(): DemoPhotoAssignment {
  return emptyPhotoAssignment();
}
