import type { DemoImportedPhoto, DemoPhotoAssignment } from "@/types/demo-url-import";

export function getExcludedPhotoUrls(photos: DemoImportedPhoto[]): Set<string> {
  return new Set(photos.filter((p) => p.excluded).map((p) => p.url));
}

export function getExcludedPhotoIds(photos: DemoImportedPhoto[]): Set<string> {
  return new Set(photos.filter((p) => p.excluded).map((p) => p.id));
}

export function isPhotoExcluded(photo: DemoImportedPhoto): boolean {
  return Boolean(photo.excluded);
}

export function filterUsablePhotos(photos: DemoImportedPhoto[]): DemoImportedPhoto[] {
  return photos.filter((p) => !p.excluded);
}

export function urlIfUsable(
  url: string,
  excludedUrls: Set<string>
): string {
  if (!url.trim()) return "";
  if (excludedUrls.has(url)) return "";
  return url;
}

/** 除外されたスロット割り当てを解除 */
export function sanitizeAssignment(
  assignment: DemoPhotoAssignment,
  photos: DemoImportedPhoto[]
): DemoPhotoAssignment {
  const excludedIds = getExcludedPhotoIds(photos);

  const clearIfExcluded = (id: string | null) =>
    id && excludedIds.has(id) ? null : id;

  return {
    hero: clearIfExcluded(assignment.hero),
    exterior: clearIfExcluded(assignment.exterior),
    interior: clearIfExcluded(assignment.interior),
    food: clearIfExcluded(assignment.food),
    gallery: assignment.gallery.filter((id) => !excludedIds.has(id)),
  };
}

export function togglePhotoExcluded(
  photos: DemoImportedPhoto[],
  photoId: string
): DemoImportedPhoto[] {
  return photos.map((p) =>
    p.id === photoId ? { ...p, excluded: !p.excluded } : p
  );
}
