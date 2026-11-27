/** Gallery mosaic size variants (index-based pattern) */
export function izakayaGalleryClass(index: number): string {
  const pattern = index % 6;
  switch (pattern) {
    case 0:
      return "izk-gallery-cell--wide";
    case 2:
      return "izk-gallery-cell--tall";
    case 4:
      return "izk-gallery-cell--square";
    default:
      return "";
  }
}
