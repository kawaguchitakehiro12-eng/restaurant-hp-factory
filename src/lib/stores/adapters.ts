import { getPhotoById, getPhotoByRole, getPhotosByRole } from "@/lib/stores/helpers";
import type { CafeData } from "@/types/cafe";
import type { LuxuryIzakayaData } from "@/types/luxury-izakaya";
import type {
  CafeExtensions,
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
export function toLuxuryIzakayaData(store: StoreRecord): LuxuryIzakayaData {
  const ext = assertLuxuryExtensions(store);
  const hero = getPhotoByRole(store, "hero");
  const about = getPhotoByRole(store, "about");
  const subCopy = Array.isArray(store.subCopy)
    ? store.subCopy
    : [store.subCopy];

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
    },
    heroImage: hero?.url ?? "",
    aboutImage: about?.url ?? "",
    useCases: ext.useCases,
    commitments: ext.commitments.map((item) => {
      const photo = getPhotoById(store, item.photoId);
      return {
        number: item.number,
        title: item.title,
        description: item.description,
        image: photo?.url ?? "",
      };
    }),
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
    topics: [...store.topics]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => ({
        date: item.date,
        title: item.title,
      })),
  };
}

/** StoreRecord → Cafeテンプレ用データ */
export function toCafeData(store: StoreRecord): CafeData {
  const ext = assertCafeExtensions(store);
  const hero = getPhotoByRole(store, "hero");
  const concept = getPhotoByRole(store, "concept");
  const interiorPhoto = getPhotoById(store, ext.interior.photoId);
  const subCopy = Array.isArray(store.subCopy)
    ? store.subCopy.join(" ")
    : store.subCopy;

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
    conceptImage: concept?.url ?? "",
    interior: {
      image: interiorPhoto?.url ?? "",
      title: ext.interior.title,
      description: ext.interior.description,
      features: ext.interior.features,
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
      })),
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
