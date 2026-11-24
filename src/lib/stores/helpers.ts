import type { StorePhoto, StorePhotoRole, StoreRecord } from "@/types/store";

export function getPhotoByRole(
  store: StoreRecord,
  role: StorePhotoRole
): StorePhoto | undefined {
  return store.photos
    .filter((p) => p.role === role)
    .sort((a, b) => a.sortOrder - b.sortOrder)[0];
}

export function getPhotosByRole(
  store: StoreRecord,
  role: StorePhotoRole
): StorePhoto[] {
  return store.photos
    .filter((p) => p.role === role)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export function getPhotoById(
  store: StoreRecord,
  photoId: string
): StorePhoto | undefined {
  return store.photos.find((p) => p.id === photoId);
}

export function isPublished(store: StoreRecord): boolean {
  return store.publishStatus === "published";
}
