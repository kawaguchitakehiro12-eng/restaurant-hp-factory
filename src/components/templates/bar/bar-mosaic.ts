/** Gallery mosaic size variants (index-based pattern) */
export function barGalleryClass(index: number): string {
  const pattern = index % 6;
  switch (pattern) {
    case 0:
      return "bar-gallery-cell--wide";
    case 2:
      return "bar-gallery-cell--tall";
    case 4:
      return "bar-gallery-cell--square";
    default:
      return "";
  }
}
