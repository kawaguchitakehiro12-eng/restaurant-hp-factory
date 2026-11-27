/** Asymmetric mosaic — class on grid children */
export function barGalleryClass(index: number): string {
  const pattern = [
    "bar-mosaic--hero",
    "bar-mosaic--tall",
    "bar-mosaic--wide",
    "bar-mosaic--sq",
    "bar-mosaic--wide",
    "bar-mosaic--tall",
  ];
  return pattern[index % pattern.length];
}
