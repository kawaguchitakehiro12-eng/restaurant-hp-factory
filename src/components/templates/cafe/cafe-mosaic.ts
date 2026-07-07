/** Gallery mosaic size variants (index-based pattern) */
export function cafeGalleryClass(index: number): string {
  const pattern = index % 6;
  switch (pattern) {
    case 0:
      return "cafe-gallery-cell--wide";
    case 2:
      return "cafe-gallery-cell--tall";
    case 4:
      return "cafe-gallery-cell--square";
    default:
      return "";
  }
}
