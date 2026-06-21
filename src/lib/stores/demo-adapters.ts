import { getPhotoById, getPhotoByRole, getPhotosByRole } from "@/lib/stores/helpers";
import {
  buildLuxuryPhotoSections,
  resolveCommitmentItems,
} from "@/lib/stores/luxury-photo-layout";
import type { HeroImageFit, HeroObjectPosition } from "@/types/hero-display";
import type { CafeData } from "@/types/cafe";
import type { LuxuryIzakayaData, MenuItem, Topic } from "@/types/luxury-izakaya";
import type { DemoSampleFlags } from "@/types/demo-content";
import type {
  CafeExtensions,
  LuxuryIzakayaExtensions,
  StoreRecord,
} from "@/types/store";

function assertLuxuryExtensions(store: StoreRecord): LuxuryIzakayaExtensions {
  if (store.templateExtensions.templateType !== "luxury-izakaya") {
    throw new Error(`Store "${store.slug}" is not a luxury-izakaya template`);
  }
  return store.templateExtensions;
}

function assertCafeExtensions(store: StoreRecord): CafeExtensions {
  if (store.templateExtensions.templateType !== "cafe") {
    throw new Error(`Store "${store.slug}" is not a cafe template`);
  }
  return store.templateExtensions;
}

export function toLuxuryIzakayaDataWithSamples(
  store: StoreRecord,
  sampleFlags: DemoSampleFlags,
  heroDisplay?: { heroFit: HeroImageFit; heroObjectPosition: HeroObjectPosition }
): LuxuryIzakayaData {
  const ext = assertLuxuryExtensions(store);
  const hero = getPhotoByRole(store, "hero");
  const about = getPhotoByRole(store, "about");
  const subCopy = Array.isArray(store.subCopy) ? store.subCopy : [store.subCopy];
  const photoSections = buildLuxuryPhotoSections(store, sampleFlags);

  const recommendations: MenuItem[] = [...store.menu]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      name: item.name,
      price: item.price,
      image: item.imageUrl,
      description: item.description,
      isSample: sampleFlags.menuItemIds.includes(item.id),
    }));

  const topics: Topic[] = [...store.topics]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((item) => ({
      date: item.date,
      title: item.title,
      body: item.category,
      isSample: sampleFlags.topicIds.includes(item.id),
    }));

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
    heroImageIsSample: Boolean(sampleFlags.photos.hero),
    heroImageFit: heroDisplay?.heroFit,
    heroObjectPosition: heroDisplay?.heroObjectPosition,
    aboutImage: about?.url ?? "",
    aboutImageIsSample: Boolean(sampleFlags.photos.interior),
    useCases: ext.useCases,
    commitments: resolveCommitmentItems(store, sampleFlags),
    recommendations,
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
      isSample: Boolean(sampleFlags.photos.gallery),
    })),
    interiorSpaceImages: photoSections.interiorSpaceImages,
    photoShowcaseImages: photoSections.photoShowcaseImages,
    showPhotoShowcase: photoSections.showPhotoShowcase,
    topics,
    taglineIsSample: Boolean(sampleFlags.basicInfo.catchCopy),
    conceptIsSample: Boolean(sampleFlags.basicInfo.concept),
  };
}

export function toCafeDataWithSamples(
  store: StoreRecord,
  sampleFlags: DemoSampleFlags,
  heroDisplay?: { heroFit: HeroImageFit; heroObjectPosition: HeroObjectPosition }
): CafeData {
  const ext = assertCafeExtensions(store);
  const hero = getPhotoByRole(store, "hero");
  const concept = getPhotoByRole(store, "concept");
  const interiorPhoto = getPhotoById(store, ext.interior.photoId);
  const subCopy = Array.isArray(store.subCopy) ? store.subCopy.join(" ") : store.subCopy;

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
    heroImageIsSample: Boolean(sampleFlags.photos.hero),
    heroImageFit: heroDisplay?.heroFit,
    heroObjectPosition: heroDisplay?.heroObjectPosition,
    conceptImage: concept?.url ?? "",
    conceptImageIsSample: Boolean(sampleFlags.photos.interior),
    interior: {
      image: interiorPhoto?.url ?? "",
      title: ext.interior.title,
      description: ext.interior.description,
      features: ext.interior.features,
      isSample: Boolean(sampleFlags.photos.interior),
    },
    popularMenu: [...store.menu]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        name: item.name,
        nameEn: item.nameEn,
        price: item.price,
        description: item.description,
        image: item.imageUrl,
        badge: item.badge,
        isSample: sampleFlags.menuItemIds.includes(item.id),
      })),
    galleryImages: getPhotosByRole(store, "gallery").map((photo) => ({
      src: photo.url,
      alt: photo.alt,
      caption: photo.caption,
      isSample: Boolean(sampleFlags.photos.gallery),
    })),
    topics: [...store.topics]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        date: item.date,
        category: item.category ?? "",
        title: item.title,
        body: item.category,
        isSample: sampleFlags.topicIds.includes(item.id),
      })),
    taglineIsSample: Boolean(sampleFlags.basicInfo.catchCopy),
    conceptIsSample: Boolean(sampleFlags.basicInfo.concept),
  };
}
