/** Asymmetric mosaic — size class applied to grid children (StaggerItem) */
export function cafeGalleryClass(index: number): string {
  const pattern = [
    "cafe-mosaic--hero",
    "cafe-mosaic--tall",
    "cafe-mosaic--wide",
    "cafe-mosaic--sq",
    "cafe-mosaic--wide",
    "cafe-mosaic--tall",
    "cafe-mosaic--sq",
    "cafe-mosaic--hero",
  ];
  return pattern[index % pattern.length];
}
