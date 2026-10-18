import { splitBalMenu } from "@/lib/stores/bal-menu-split";
import { getPhotoById, getPhotoByRole, getPhotosByRole } from "@/lib/stores/helpers";
import type { HeroImageFit, HeroObjectPosition } from "@/types/hero-display";
import {
  DEFAULT_HERO_FIT,
  DEFAULT_HERO_OBJECT_POSITION,
} from "@/types/hero-display";
import type { BalData, BalPhoto } from "@/types/bal";
import type { DemoSampleFlags } from "@/types/demo-content";
import type { BalExtensions, StorePhoto, StoreRecord } from "@/types/store";

type HeroDisplay = { heroFit: HeroImageFit; heroObjectPosition: HeroObjectPosition };

type SamplePhotoKey = keyof DemoSampleFlags["photos"];

function assertBalExtensions(store: StoreRecord): BalExtensions {
  if (store.templateExtensions.templateType !== "bal") {
    throw new Error(`Store "${store.slug}" is not a bal template`);
  }
  return store.templateExtensions;
}

const ROLE_SAMPLE_KEY: Partial<Record<StorePhoto["role"], SamplePhotoKey>> = {
  hero: "hero",
  about: "interior",
  concept: "interior",
  interior: "interior",
  food: "food",
  exterior: "exterior",
  gallery: "gallery",
};

/** StoreRecord → バルテンプレ用データ（sampleFlags があればデモ用のサンプル表示も付与） */
export function buildBalData(
  store: StoreRecord,
  options: { heroDisplay?: HeroDisplay; sampleFlags?: DemoSampleFlags } = {}
): BalData {
  const { heroDisplay, sampleFlags } = options;
  const ext = assertBalExtensions(store);

  const isSamplePhoto = (photo: StorePhoto): boolean | undefined => {
    if (!sampleFlags) return undefined;
    const key = ROLE_SAMPLE_KEY[photo.role];
    return key ? Boolean(sampleFlags.photos[key]) : false;
  };

  const toPhoto = (photo: StorePhoto): BalPhoto => ({
    src: photo.url,
    alt: photo.alt,
    caption: photo.caption,
    isSample: isSamplePhoto(photo),
  });

  const hero = getPhotoByRole(store, "hero");
  const food = getPhotoByRole(store, "food");
  const about = getPhotoByRole(store, "about") ?? getPhotoByRole(store, "concept");
  const interior = getPhotoById(store, ext.table.photoId) ?? getPhotoByRole(store, "interior");
  const exterior = getPhotoByRole(store, "exterior");
  const gallery = getPhotosByRole(store, "gallery");
  const heroUrl = hero?.url ?? food?.url ?? "";

  const uniquePhotos = (candidates: (StorePhoto | undefined)[], exclude: string[], limit: number) => {
    const seen = new Set(exclude.filter(Boolean));
    const result: BalPhoto[] = [];
    for (const photo of candidates) {
      if (!photo?.url || seen.has(photo.url)) continue;
      seen.add(photo.url);
      result.push(toPhoto(photo));
      if (result.length >= limit) break;
    }
    return result;
  };

  const heroWindows = uniquePhotos([food, gallery[0], about, interior, exterior], [heroUrl], 2);
  const tablePhotos = uniquePhotos([interior, about, exterior, ...gallery.slice(1)], [], 3);

  const mappedMenu = [...store.menu]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      name: item.name,
      nameEn: item.nameEn,
      price: item.price,
      description: item.description,
      image: item.imageUrl,
      badge: item.badge,
      isSample: sampleFlags ? sampleFlags.menuItemIds.includes(item.id) : undefined,
    }));
  const { tapas, wines, boardItems } = splitBalMenu(mappedMenu);

  const subCopy = Array.isArray(store.subCopy) ? store.subCopy.join(" ") : store.subCopy;

  return {
    store: {
      name: store.name,
      nameEn: store.nameEn,
      location: store.location,
      tagline: store.catchCopy,
      heroMessage: subCopy,
      concept: store.concept,
      highlights: ext.highlights,
      address: store.address,
      phone: store.phone,
      hours: {
        dinner: store.businessHours.dinner ?? "",
        closed: store.closedDays,
      },
      access: store.access,
      reservationUrl: store.reservationUrl,
      instagramUrl: store.instagramUrl ?? "",
      instagramHandle: store.instagramHandle ?? "",
      mapEmbedUrl: store.mapEmbedUrl,
    },
    heroImage: heroUrl,
    heroImageIsSample: sampleFlags ? Boolean(sampleFlags.photos.hero) : undefined,
    heroImageFit: heroDisplay?.heroFit ?? DEFAULT_HERO_FIT,
    heroObjectPosition: heroDisplay?.heroObjectPosition ?? DEFAULT_HERO_OBJECT_POSITION,
    heroWindows,
    tapas,
    wines,
    boardItems,
    courses: [...store.courses]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        name: item.name,
        price: item.price,
        note: item.note,
        featured: item.isFeatured,
      })),
    happyHour: ext.happyHour,
    table: {
      title: ext.table.title,
      description: ext.table.description,
      features: ext.table.features,
      photos: tablePhotos,
    },
    galleryImages: gallery.map(toPhoto),
    topics: [...store.topics]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        date: item.date,
        category: item.category ?? "",
        title: item.title,
        isSample: sampleFlags ? sampleFlags.topicIds.includes(item.id) : undefined,
      })),
    taglineIsSample: sampleFlags ? Boolean(sampleFlags.basicInfo.catchCopy) : undefined,
    conceptIsSample: sampleFlags ? Boolean(sampleFlags.basicInfo.concept) : undefined,
  };
}
