import { getPhotoById, getPhotoByRole, getPhotosByRole } from "@/lib/stores/helpers";
import type { DemoSampleFlags } from "@/types/demo-content";
import type { Commitment, GalleryImage } from "@/types/luxury-izakaya";
import type { StorePhoto, StoreRecord } from "@/types/store";

const PHOTO_ID_SLOTS: Record<string, keyof DemoSampleFlags["photos"]> = {
  "photo-hero": "hero",
  "photo-interior": "interior",
  "photo-about": "interior",
  "photo-food": "food",
  "photo-exterior": "exterior",
};

function isSamplePhotoId(id: string): boolean {
  return id.startsWith("sample-");
}

function isPhotoSample(photo: StorePhoto, sampleFlags?: DemoSampleFlags): boolean {
  if (!sampleFlags) return false;
  if (isSamplePhotoId(photo.id)) return true;

  const slot = PHOTO_ID_SLOTS[photo.id];
  if (slot && sampleFlags.photos[slot]) return true;

  if (photo.role === "gallery" && sampleFlags.photos.gallery) {
    return true;
  }

  return false;
}

function toGalleryImage(photo: StorePhoto, sampleFlags?: DemoSampleFlags): GalleryImage {
  return {
    src: photo.url,
    alt: photo.alt,
    caption: photo.caption,
    isSample: isPhotoSample(photo, sampleFlags),
  };
}

function dedupePhotos(photos: StorePhoto[]): StorePhoto[] {
  const seen = new Set<string>();
  return photos.filter((photo) => {
    if (seen.has(photo.url)) return false;
    seen.add(photo.url);
    return true;
  });
}

function collectPhotos(
  groups: StorePhoto[][],
  max: number,
  excludeUrls: Set<string> = new Set()
): StorePhoto[] {
  const result: StorePhoto[] = [];
  const seen = new Set(excludeUrls);

  for (const group of groups) {
    for (const photo of group) {
      if (result.length >= max) return result;
      if (seen.has(photo.url)) continue;
      seen.add(photo.url);
      result.push(photo);
    }
  }

  return result;
}

function dedicatedGalleryPhotos(store: StoreRecord): StorePhoto[] {
  const reservedIds = new Set(["photo-food", "photo-exterior"]);
  return getPhotosByRole(store, "gallery").filter((photo) => !reservedIds.has(photo.id));
}

export function resolveCommitmentItems(
  store: StoreRecord,
  sampleFlags?: DemoSampleFlags
): Commitment[] {
  const ext = store.templateExtensions;
  if (ext.templateType !== "luxury-izakaya") return [];

  const food = getPhotoByRole(store, "food");
  const hero = getPhotoByRole(store, "hero");
  const gallery = dedicatedGalleryPhotos(store);
  const fallbackChain = [food, hero, ...gallery].filter(Boolean) as StorePhoto[];

  return ext.commitments.map((item, index) => {
    const assigned = getPhotoById(store, item.photoId);

    if (assigned?.url) {
      return {
        number: item.number,
        title: item.title,
        description: item.description,
        image: assigned.url,
        imageIsSample: isPhotoSample(assigned, sampleFlags),
      };
    }

    const fallback = fallbackChain[index % Math.max(fallbackChain.length, 1)];
    if (fallback) {
      return {
        number: item.number,
        title: item.title,
        description: item.description,
        image: fallback.url,
        imageIsSample: isPhotoSample(fallback, sampleFlags),
      };
    }

    return {
      number: item.number,
      title: item.title,
      description: item.description,
      image: "",
      imageIsSample: Boolean(sampleFlags?.photos.food),
    };
  });
}

export function buildInteriorSpaceImages(
  store: StoreRecord,
  sampleFlags?: DemoSampleFlags,
  max = 6
): GalleryImage[] {
  const interior = getPhotosByRole(store, "interior");
  const about = getPhotoByRole(store, "about");
  const gallery = dedicatedGalleryPhotos(store);

  const photos = collectPhotos(
    [
      interior,
      about ? [about] : [],
      gallery,
    ],
    max
  );

  return photos.map((photo) => toGalleryImage(photo, sampleFlags));
}

export function buildPhotoShowcaseImages(
  store: StoreRecord,
  sampleFlags?: DemoSampleFlags,
  interiorUrls: Set<string> = new Set(),
  max = 12
): GalleryImage[] {
  const food = getPhotoByRole(store, "food");
  const exterior = getPhotoByRole(store, "exterior");
  const interior = getPhotosByRole(store, "interior");
  const hero = getPhotoByRole(store, "hero");
  const gallery = dedicatedGalleryPhotos(store);
  const about = getPhotoByRole(store, "about");
  const commitment = getPhotosByRole(store, "commitment");

  const photos = collectPhotos(
    [
      food ? [food] : [],
      exterior ? [exterior] : [],
      interior,
      hero ? [hero] : [],
      gallery,
      about ? [about] : [],
      commitment,
    ],
    max,
    interiorUrls
  );

  return photos.map((photo) => toGalleryImage(photo, sampleFlags));
}

export function shouldShowPhotoShowcase(
  store: StoreRecord,
  showcaseImages: GalleryImage[]
): boolean {
  if (showcaseImages.length >= 4) return true;
  return dedupePhotos(store.photos).length > 6;
}

export function buildLuxuryPhotoSections(
  store: StoreRecord,
  sampleFlags?: DemoSampleFlags
): {
  interiorSpaceImages: GalleryImage[];
  photoShowcaseImages: GalleryImage[];
  showPhotoShowcase: boolean;
} {
  const interiorSpaceImages = buildInteriorSpaceImages(store, sampleFlags);
  const interiorUrls = new Set(interiorSpaceImages.map((image) => image.src));
  const photoShowcaseImages = buildPhotoShowcaseImages(
    store,
    sampleFlags,
    interiorUrls
  );

  return {
    interiorSpaceImages,
    photoShowcaseImages,
    showPhotoShowcase: shouldShowPhotoShowcase(store, photoShowcaseImages),
  };
}
