import { nueeStore } from "@/data/stores/nuee";
import { shogetsuStore } from "@/data/stores/shogetsu";
import type { DemoSite } from "@/types/demo";
import type {
  DemoBasicInfo,
  DemoMenuItem,
  DemoSampleFlags,
  DemoSiteContent,
  DemoTopicItem,
} from "@/types/demo-content";
import { ensureDemoContent } from "@/types/demo-content";
import { getTemplateSamples } from "@/lib/stores/demo-samples";
import { getHeroDisplayFromPhotos } from "@/lib/stores/store-photo-overrides";
import type { HeroImageFit, HeroObjectPosition } from "@/types/hero-display";
import type {
  StoreCourseItem,
  StoreMenuItem,
  StorePhoto,
  StoreRecord,
  StoreTopic,
} from "@/types/store";

function cloneStore(store: StoreRecord): StoreRecord {
  return structuredClone(store);
}

function isFilled(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function pickString(
  user: string | undefined,
  sample: string,
  flagKey: keyof DemoBasicInfo,
  flags: DemoSampleFlags
): string {
  if (isFilled(user)) return user!.trim();
  flags.basicInfo[flagKey] = true;
  return sample;
}

function locationFromAddress(address: string): string {
  const match = address.match(/(?:東京都|大阪府|京都府|[^\s]+県)([^\d]+?[市区町村])/);
  if (match?.[1]) return match[1].trim();
  if (address.length > 12) return `${address.slice(0, 12)}…`;
  return address || "東京";
}

function toNameEn(name: string, user?: string): string {
  if (isFilled(user)) return user!.trim();
  return name.replace(/\s+/g, " ").trim().toUpperCase() || "DEMO STORE";
}

function resolveMenus(
  userMenus: DemoMenuItem[],
  templateId: DemoSite["templateId"],
  flags: DemoSampleFlags
): StoreMenuItem[] {
  const filled = userMenus
    .filter((m) => m.visible && isFilled(m.name))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  if (filled.length > 0) {
    return filled.map((m, i) => ({
      id: m.id,
      sortOrder: i + 1,
      name: m.name.trim(),
      price: m.price.trim() || "¥—",
      description: m.description.trim() || undefined,
      imageUrl: m.imageUrl.trim() || getTemplateSamples(templateId).food,
    }));
  }

  const samples = getTemplateSamples(templateId).menus;
  return samples.map((m, i) => {
    flags.menuItemIds.push(`sample-menu-${i}`);
    return {
      id: `sample-menu-${i}`,
      sortOrder: i + 1,
      name: m.name,
      price: m.price,
      description: m.description,
      imageUrl: m.imageUrl,
    };
  });
}

function resolveTopics(
  userTopics: DemoTopicItem[],
  templateId: DemoSite["templateId"],
  flags: DemoSampleFlags
): StoreTopic[] {
  const filled = userTopics
    .filter((t) => t.visible && isFilled(t.title))
    .sort((a, b) => a.date.localeCompare(b.date));

  if (filled.length > 0) {
    return filled.map((t, i) => ({
      id: t.id,
      sortOrder: i + 1,
      date: t.date.trim(),
      title: t.title.trim(),
      category: t.body.trim() || undefined,
    }));
  }

  const samples = getTemplateSamples(templateId).topics;
  return samples.map((t, i) => {
    flags.topicIds.push(`sample-topic-${i}`);
    return {
      id: `sample-topic-${i}`,
      sortOrder: i + 1,
      date: t.date,
      title: t.title,
      category: t.body,
    };
  });
}

function resolvePhotoUrl(
  user: string | undefined,
  sample: string,
  slot: keyof DemoSampleFlags["photos"],
  flags: DemoSampleFlags
): string {
  if (isFilled(user)) return user!.trim();
  flags.photos[slot] = true;
  return sample;
}

export type ResolvedDemoStore = {
  store: StoreRecord;
  sampleFlags: DemoSampleFlags;
  heroFit: HeroImageFit;
  heroObjectPosition: HeroObjectPosition;
};

export function resolveDemoStore(demo: DemoSite): ResolvedDemoStore {
  const content = ensureDemoContent(demo.content);
  const samples = getTemplateSamples(demo.templateId);
  const flags: DemoSampleFlags = {
    basicInfo: {},
    photos: {},
    menuItemIds: [],
    topicIds: [],
  };

  const base = demo.templateType === "cafe" ? cloneStore(nueeStore) : cloneStore(shogetsuStore);
  const bi = content.basicInfo;

  const catchCopy = pickString(bi.catchCopy, samples.catchCopy, "catchCopy", flags);
  const concept = pickString(bi.concept, samples.concept, "concept", flags);
  const address = pickString(
    bi.address || demo.address,
    base.address,
    "address",
    flags
  );
  const phone = pickString(bi.phone || demo.phone, base.phone, "phone", flags);
  const closedDays = pickString(bi.closedDays, samples.closedDays, "closedDays", flags);
  const access = pickString(bi.access, base.access, "access", flags);
  const mapEmbedUrl = pickString(bi.mapEmbedUrl, base.mapEmbedUrl, "mapEmbedUrl", flags);
  const instagramUrl = pickString(
    bi.instagramUrl || demo.sourceUrl,
    base.instagramUrl ?? "",
    "instagramUrl",
    flags
  );
  const reservationUrl = pickString(
    bi.reservationUrl,
    base.reservationUrl,
    "reservationUrl",
    flags
  );

  const nameEn = toNameEn(demo.storeName, bi.nameEn);
  if (!isFilled(bi.nameEn)) flags.basicInfo.nameEn = true;

  let subCopy: string | string[];
  if (demo.templateType === "cafe") {
    const sub = pickString(bi.subCopy, samples.subCopy, "subCopy", flags);
    subCopy = sub;
  } else {
    const lines =
      bi.subCopyLines.filter((l) => l.trim()).length > 0
        ? bi.subCopyLines.filter((l) => l.trim())
        : null;
    if (lines) {
      subCopy = lines;
    } else {
      flags.basicInfo.subCopyLines = true;
      subCopy = samples.subCopyLines;
    }
  }

  const heroUrl = resolvePhotoUrl(content.photos.hero, samples.hero, "hero", flags);
  const interiorUrl = resolvePhotoUrl(
    content.photos.interior,
    samples.interior,
    "interior",
    flags
  );
  const foodUrl = resolvePhotoUrl(content.photos.food, samples.food, "food", flags);
  const exteriorUrl = resolvePhotoUrl(
    content.photos.exterior,
    samples.exterior,
    "exterior",
    flags
  );

  const galleryUser = content.photos.gallery.filter((g) => isFilled(g.url));
  let galleryPhotos: StorePhoto[];
  if (galleryUser.length > 0) {
    galleryPhotos = galleryUser.map((g, i) => ({
      id: g.id,
      sortOrder: i + 1,
      role: "gallery" as const,
      url: g.url.trim(),
      alt: g.alt.trim() || `${demo.storeName} ギャラリー`,
      caption: g.caption.trim() || undefined,
    }));
  } else {
    flags.photos.gallery = true;
    galleryPhotos = [
      {
        id: "sample-gallery-1",
        sortOrder: 1,
        role: "gallery",
        url: samples.hero,
        alt: `${demo.storeName} 店内`,
      },
      {
        id: "sample-gallery-2",
        sortOrder: 2,
        role: "gallery",
        url: samples.interior,
        alt: `${demo.storeName} 料理`,
      },
    ];
  }

  const menu = resolveMenus(content.menus, demo.templateId, flags);
  const topics = resolveTopics(content.topics, demo.templateId, flags);

  const businessHours =
    demo.templateType === "cafe"
      ? {
          weekday: pickString(bi.weekdayHours, samples.weekdayHours, "weekdayHours", flags),
          weekend: pickString(bi.weekendHours, samples.weekendHours, "weekendHours", flags),
        }
      : {
          dinner: pickString(bi.businessHours, samples.businessHours, "businessHours", flags),
        };

  const photos: StorePhoto[] = [
    {
      id: "photo-hero",
      sortOrder: 1,
      role: "hero",
      url: heroUrl,
      alt: `${demo.storeName} ファーストビュー`,
    },
    {
      id: "photo-about",
      sortOrder: 2,
      role: demo.templateType === "cafe" ? "concept" : "about",
      url: demo.templateType === "cafe" ? interiorUrl : interiorUrl,
      alt: `${demo.storeName} 店内`,
    },
    {
      id: "photo-interior",
      sortOrder: 3,
      role: "interior",
      url: interiorUrl,
      alt: `${demo.storeName} 店内`,
    },
    {
      id: "photo-food",
      sortOrder: 4,
      role: "food",
      url: foodUrl,
      alt: `${demo.storeName} 料理`,
    },
    {
      id: "photo-exterior",
      sortOrder: 5,
      role: "exterior",
      url: exteriorUrl,
      alt: `${demo.storeName} 外観`,
    },
    ...galleryPhotos.map((p, i) => ({ ...p, sortOrder: 6 + i })),
  ];

  const courses: StoreCourseItem[] = base.courses.map((c) => ({ ...c }));

  const store: StoreRecord = {
    ...base,
    id: demo.storeId,
    slug: demo.storeSlug,
    templateType: demo.templateType,
    publishStatus: "published",
    name: demo.storeName,
    nameEn,
    location: locationFromAddress(address),
    catchCopy,
    subCopy,
    concept,
    address,
    phone,
    access,
    mapEmbedUrl,
    instagramUrl: instagramUrl || null,
    instagramHandle: instagramUrl.includes("instagram") ? `@${demo.storeSlug}` : base.instagramHandle,
    reservationUrl,
    businessHours,
    closedDays,
    menu,
    courses,
    topics,
    photos,
  };

  if (store.templateExtensions.templateType === "luxury-izakaya") {
    store.templateExtensions = {
      ...store.templateExtensions,
      story: isFilled(concept)
        ? [concept.slice(0, 80), "SAKUPAGEデモサイトの完成イメージです。"]
        : [
            `${demo.storeName}向けにSAKUPAGEが作成したデモサイトです。`,
            "実際の掲載写真やメニューは、ご契約後に管理画面より自由に編集できます。",
          ],
    };
  }

  if (store.templateExtensions.templateType === "cafe") {
    store.templateExtensions = {
      ...store.templateExtensions,
      conceptPoints: [
        `${demo.storeName}向けデモ`,
        "SAKUPAGEで作成した完成イメージ",
        "ご契約後に自由に編集可能",
      ],
      interior: {
        ...store.templateExtensions.interior,
        photoId: "photo-interior",
      },
    };
  }

  const heroDisplay = getHeroDisplayFromPhotos(content.photos);

  return {
    store,
    sampleFlags: flags,
    heroFit: heroDisplay.heroFit,
    heroObjectPosition: heroDisplay.heroObjectPosition,
  };
}
