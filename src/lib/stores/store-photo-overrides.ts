import type { DemoPhotos } from "@/types/demo-content";
import {
  DEFAULT_HERO_FIT,
  DEFAULT_HERO_OBJECT_POSITION,
  normalizeHeroFit,
  normalizeHeroObjectPosition,
  type HeroImageFit,
  type HeroObjectPosition,
} from "@/types/hero-display";

export const STORE_PHOTO_OVERRIDES_KEY = "sakupage:store-photo-overrides";

export type StorePhotoOverride = {
  photos: DemoPhotos;
  updatedAt: string;
};

export type StorePhotoOverridesMap = Record<string, StorePhotoOverride>;

function readMap(): StorePhotoOverridesMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORE_PHOTO_OVERRIDES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as StorePhotoOverridesMap;
  } catch {
    return {};
  }
}

export function loadStorePhotoOverride(slug: string): StorePhotoOverride | null {
  return readMap()[slug] ?? null;
}

export function saveStorePhotoOverride(slug: string, photos: DemoPhotos): void {
  const map = readMap();
  map[slug] = {
    photos: {
      ...photos,
      heroFit: normalizeHeroFit(photos.heroFit),
      heroObjectPosition: normalizeHeroObjectPosition(photos.heroObjectPosition),
    },
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem(STORE_PHOTO_OVERRIDES_KEY, JSON.stringify(map));
  window.dispatchEvent(
    new StorageEvent("storage", {
      key: STORE_PHOTO_OVERRIDES_KEY,
    })
  );
}

export function getHeroDisplayFromPhotos(photos: DemoPhotos): {
  heroFit: HeroImageFit;
  heroObjectPosition: HeroObjectPosition;
} {
  return {
    heroFit: normalizeHeroFit(photos.heroFit),
    heroObjectPosition: normalizeHeroObjectPosition(photos.heroObjectPosition),
  };
}

export function withDefaultHeroDisplay(photos: DemoPhotos): DemoPhotos {
  return {
    ...photos,
    heroFit: normalizeHeroFit(photos.heroFit ?? DEFAULT_HERO_FIT),
    heroObjectPosition: normalizeHeroObjectPosition(
      photos.heroObjectPosition ?? DEFAULT_HERO_OBJECT_POSITION
    ),
  };
}
