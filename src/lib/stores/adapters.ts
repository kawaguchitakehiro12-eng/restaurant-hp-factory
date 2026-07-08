import { splitBarMenu } from "@/lib/stores/bar-menu-split";
import { splitCafeMenu } from "@/lib/stores/cafe-menu-split";
import { splitIzakayaCasualMenu } from "@/lib/stores/izakaya-casual-menu-split";
import { getPhotoById, getPhotoByRole, getPhotosByRole } from "@/lib/stores/helpers";
import {
  buildLuxuryPhotoSections,
  resolveCommitmentItems,
} from "@/lib/stores/luxury-photo-layout";
import type { HeroImageFit, HeroObjectPosition } from "@/types/hero-display";
import {
  DEFAULT_HERO_FIT,
  DEFAULT_HERO_OBJECT_POSITION,
} from "@/types/hero-display";
import type { BarData } from "@/types/bar";
import type { CafeData } from "@/types/cafe";
import type { IzakayaCasualData } from "@/types/izakaya-casual";
import type { LuxuryIzakayaData } from "@/types/luxury-izakaya";
import type {
  BarExtensions,
  CafeExtensions,
  IzakayaCasualExtensions,
  LuxuryIzakayaExtensions,
  StoreRecord,
} from "@/types/store";

function assertLuxuryExtensions(
  store: StoreRecord
): LuxuryIzakayaExtensions {
  if (store.templateExtensions.templateType !== "luxury-izakaya") {
    throw new Error(
      `Store "${store.slug}" is not a luxury-izakaya template`
    );
  }
  return store.templateExtensions;
}

function assertCafeExtensions(store: StoreRecord): CafeExtensions {
  if (store.templateExtensions.templateType !== "cafe") {
    throw new Error(`Store "${store.slug}" is not a cafe template`);
  }
  return store.templateExtensions;
}

/** StoreRecord → 和風居酒屋テンプレ用データ */
export function toLuxuryIzakayaData(
  store: StoreRecord,
  heroDisplay?: { heroFit: HeroImageFit; heroObjectPosition: HeroObjectPosition }
): LuxuryIzakayaData {
  const ext = assertLuxuryExtensions(store);
  const hero = getPhotoByRole(store, "hero");
  const about = getPhotoByRole(store, "about");
  const subCopy = Array.isArray(store.subCopy)
    ? store.subCopy
    : [store.subCopy];
  const photoSections = buildLuxuryPhotoSections(store);

  return {
    store: {
      name: store.name,
      nameEn: store.nameEn,
      location: store.location,
      exclusivity: ext.exclusivity,
      tagline: store.catchCopy,
      heroCopy: subCopy,
      concept: store.concept,
      story: ext.story,
      address: store.address,
      phone: store.phone,
      hours: {
        dinner: store.businessHours.dinner ?? "",
        closed: store.closedDays,
      },
      seats: ext.seats,
      access: store.access,
      reservationUrl: store.reservationUrl,
      mapEmbedUrl: store.mapEmbedUrl,
      instagramUrl: store.instagramUrl,
    },
    heroImage: hero?.url ?? "",
    heroImageFit: heroDisplay?.heroFit ?? DEFAULT_HERO_FIT,
    heroObjectPosition:
      heroDisplay?.heroObjectPosition ?? DEFAULT_HERO_OBJECT_POSITION,
    aboutImage: about?.url ?? "",
    useCases: ext.useCases,
    commitments: resolveCommitmentItems(store),
    recommendations: [...store.menu]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        name: item.name,
        price: item.price,
        image: item.imageUrl,
      })),
    courses: [...store.courses]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        name: item.name,
        price: item.price,
        note: item.note,
        featured: item.isFeatured,
      })),
    galleryImages: getPhotosByRole(store, "gallery").map((photo) => ({
      src: photo.url,
      alt: photo.alt,
      caption: photo.caption,
    })),
    interiorSpaceImages: photoSections.interiorSpaceImages,
    photoShowcaseImages: photoSections.photoShowcaseImages,
    showPhotoShowcase: photoSections.showPhotoShowcase,
    topics: [...store.topics]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        date: item.date,
        title: item.title,
      })),
  };
}

/** StoreRecord → Cafeテンプレ用データ */
export function toCafeData(
  store: StoreRecord,
  heroDisplay?: { heroFit: HeroImageFit; heroObjectPosition: HeroObjectPosition }
): CafeData {
  const ext = assertCafeExtensions(store);
  const hero = getPhotoByRole(store, "hero");
  const concept = getPhotoByRole(store, "concept");
  const interiorPhoto = getPhotoById(store, ext.interior.photoId);
  const subCopy = Array.isArray(store.subCopy)
    ? store.subCopy.join(" ")
    : store.subCopy;

  const menuItems = [...store.menu]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      name: item.name,
      nameEn: item.nameEn,
      price: item.price,
      description: item.description,
      image: item.imageUrl,
      badge: item.badge,
    }));
  const { popularMenu, foodMenu, drinkMenu } = splitCafeMenu(menuItems);

  return {
    store: {
      name: store.name,
      nameEn: store.nameEn,
      location: store.location,
      tagline: store.catchCopy,
      heroMessage: subCopy,
      concept: store.concept,
      conceptPoints: ext.conceptPoints,
      address: store.address,
      phone: store.phone,
      hours: {
        weekday: store.businessHours.weekday ?? "",
        weekend: store.businessHours.weekend ?? "",
        closed: store.closedDays,
      },
      access: store.access,
      reservationUrl: store.reservationUrl,
      instagramUrl: store.instagramUrl ?? "",
      instagramHandle: store.instagramHandle ?? "",
      mapEmbedUrl: store.mapEmbedUrl,
    },
    heroImage: hero?.url ?? "",
    heroImageFit: heroDisplay?.heroFit ?? DEFAULT_HERO_FIT,
    heroObjectPosition:
      heroDisplay?.heroObjectPosition ?? DEFAULT_HERO_OBJECT_POSITION,
    conceptImage: concept?.url ?? "",
    interior: {
      image: interiorPhoto?.url ?? "",
      title: ext.interior.title,
      description: ext.interior.description,
      features: ext.interior.features,
    },
    popularMenu,
    foodMenu,
    drinkMenu,
    galleryImages: getPhotosByRole(store, "gallery").map((photo) => ({
      src: photo.url,
      alt: photo.alt,
      caption: photo.caption,
    })),
    topics: [...store.topics]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        date: item.date,
        category: item.category ?? "",
        title: item.title,
      })),
  };
}

function assertBarExtensions(store: StoreRecord): BarExtensions {
  if (store.templateExtensions.templateType !== "bar") {
    throw new Error(`Store "${store.slug}" is not a bar template`);
  }
  return store.templateExtensions;
}

/** StoreRecord → Barテンプレ用データ */
export function toBarData(
  store: StoreRecord,
  heroDisplay?: { heroFit: HeroImageFit; heroObjectPosition: HeroObjectPosition }
): BarData {
  const ext = assertBarExtensions(store);
  const hero = getPhotoByRole(store, "hero");
  const concept = getPhotoByRole(store, "concept");
  const spacePhoto = getPhotoById(store, ext.space.photoId);
  const subCopy = Array.isArray(store.subCopy) ? store.subCopy : [store.subCopy];

  const menuItems = [...store.menu]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      name: item.name,
      nameEn: item.nameEn,
      price: item.price,
      description: item.description,
      image: item.imageUrl,
      badge: item.badge,
    }));
  const { signatureDrinks, foodSnacks } = splitBarMenu(menuItems);

  return {
    store: {
      name: store.name,
      nameEn: store.nameEn,
      location: store.location,
      tagline: store.catchCopy,
      heroCopy: subCopy,
      concept: store.concept,
      conceptPoints: ext.conceptPoints,
      address: store.address,
      phone: store.phone,
      hours: {
        dinner: store.businessHours.dinner ?? "",
        closed: store.closedDays,
      },
      access: store.access,
      reservationUrl: store.reservationUrl,
      instagramUrl: store.instagramUrl ?? "",
      mapEmbedUrl: store.mapEmbedUrl,
    },
    heroImage: hero?.url ?? "",
    heroImageFit: heroDisplay?.heroFit ?? DEFAULT_HERO_FIT,
    heroObjectPosition:
      heroDisplay?.heroObjectPosition ?? DEFAULT_HERO_OBJECT_POSITION,
    conceptImage: concept?.url ?? "",
    space: {
      image: spacePhoto?.url ?? "",
      title: ext.space.title,
      description: ext.space.description,
      features: ext.space.features,
    },
    signatureDrinks,
    foodSnacks,
    galleryImages: getPhotosByRole(store, "gallery").map((photo) => ({
      src: photo.url,
      alt: photo.alt,
      caption: photo.caption,
    })),
    topics: [...store.topics]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        date: item.date,
        category: item.category ?? "",
        title: item.title,
      })),
  };
}

function assertIzakayaCasualExtensions(
  store: StoreRecord
): IzakayaCasualExtensions {
  if (store.templateExtensions.templateType !== "izakaya-casual") {
    throw new Error(`Store "${store.slug}" is not an izakaya-casual template`);
  }
  return store.templateExtensions;
}

/** StoreRecord → 大衆居酒屋テンプレ用データ */
export function toIzakayaCasualData(
  store: StoreRecord,
  heroDisplay?: { heroFit: HeroImageFit; heroObjectPosition: HeroObjectPosition }
): IzakayaCasualData {
  const ext = assertIzakayaCasualExtensions(store);
  const hero = getPhotoByRole(store, "hero");
  const spacePhoto = getPhotoById(store, ext.space.photoId);
  const subCopy = Array.isArray(store.subCopy)
    ? store.subCopy.join(" ")
    : store.subCopy;

  const mappedMenu = [...store.menu]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      name: item.name,
      nameEn: item.nameEn,
      price: item.price,
      description: item.description,
      image: item.imageUrl,
      badge: item.badge,
    }));
  const { specialtyDishes, todaysSpecials, menuItems } =
    splitIzakayaCasualMenu(mappedMenu);

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
      mapEmbedUrl: store.mapEmbedUrl,
    },
    heroImage: hero?.url ?? "",
    heroImageFit: heroDisplay?.heroFit ?? DEFAULT_HERO_FIT,
    heroObjectPosition:
      heroDisplay?.heroObjectPosition ?? DEFAULT_HERO_OBJECT_POSITION,
    specialtyDishes,
    todaysSpecials,
    menuItems,
    courses: [...store.courses]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        name: item.name,
        price: item.price,
        note: item.note,
        featured: item.isFeatured,
      })),
    space: {
      image: spacePhoto?.url ?? "",
      title: ext.space.title,
      description: ext.space.description,
      features: ext.space.features,
    },
    galleryImages: getPhotosByRole(store, "gallery").map((photo) => ({
      src: photo.url,
      alt: photo.alt,
      caption: photo.caption,
    })),
    topics: [...store.topics]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        date: item.date,
        category: item.category ?? "",
        title: item.title,
      })),
  };
}
