import { SampleLabel } from "@/components/demo/SampleLabel";
import { FadeIn } from "@/components/ui/FadeIn";
import { BalFillImage } from "@/components/templates/bal/ui/BalFillImage";
import { BalSectionHead } from "@/components/templates/bal/ui/BalSectionHead";
import type { BalPhoto } from "@/types/bal";

type GalleryProps = {
  galleryImages: BalPhoto[];
  instagramUrl: string;
  instagramHandle: string;
};

type Cell =
  | { kind: "photo"; photo: BalPhoto; index: number }
  | { kind: "tile"; variant: "terracotta" | "olive" | "bordeaux"; word?: string };

const TILE_SEQUENCE: Extract<Cell, { kind: "tile" }>[] = [
  { kind: "tile", variant: "terracotta", word: "¡SALUD!" },
  { kind: "tile", variant: "olive" },
  { kind: "tile", variant: "bordeaux", word: "CIN CIN" },
];

function buildCells(photos: BalPhoto[]): Cell[] {
  const cells: Cell[] = [];
  let tile = 0;
  photos.forEach((photo, index) => {
    cells.push({ kind: "photo", photo, index });
    if ((index === 0 || index === 2 || index === 4) && tile < TILE_SEQUENCE.length) {
      cells.push(TILE_SEQUENCE[tile]);
      tile += 1;
    }
  });
  return cells;
}

export function Gallery({ galleryImages, instagramUrl, instagramHandle }: GalleryProps) {
  const photos = galleryImages.filter((photo) => photo.src).slice(0, 6);
  if (photos.length === 0) return null;

  const cells = buildCells(photos);

  return (
    <section id="gallery" className="bal-section bal-gallery">
      <div className="bal-tile-strip" aria-hidden />
      <div className="bal-shell">
        <FadeIn>
          <BalSectionHead en="GALLERY" ja="今夜のテーブルから。" />
        </FadeIn>

        <div className="bal-gallery-grid">
          {cells.map((cell, i) =>
            cell.kind === "photo" ? (
              <figure
                key={`photo-${cell.index}`}
                className={`bal-gallery-cell bal-gallery-photo bal-gallery-photo--${cell.index + 1}`}
                style={{ position: "relative" }}
              >
                <BalFillImage
                  src={cell.photo.src}
                  alt={cell.photo.alt}
                  className="bal-photo object-cover"
                  sizes={cell.index === 0 ? "(min-width: 1024px) 40vw, 100vw" : "(min-width: 1024px) 22vw, 50vw"}
                />
                {cell.photo.caption ? <figcaption>{cell.photo.caption}</figcaption> : null}
                {cell.photo.isSample ? <SampleLabel className="demo-sample-label--image" /> : null}
              </figure>
            ) : (
              <div
                key={`tile-${i}`}
                className={`bal-gallery-cell bal-tile bal-tile--${cell.variant}`}
                aria-hidden
              >
                {cell.word ? <span className="bal-tile-word">{cell.word}</span> : null}
              </div>
            )
          )}
        </div>

        {instagramUrl ? (
          <p className="bal-gallery-insta">
            <a href={instagramUrl} target="_blank" rel="noopener noreferrer">
              Instagram {instagramHandle || ""} →
            </a>
          </p>
        ) : null}
      </div>
    </section>
  );
}
