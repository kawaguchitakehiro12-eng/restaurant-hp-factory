import { SampleLabel } from "@/components/demo/SampleLabel";
import { FadeIn } from "@/components/ui/FadeIn";
import { BalFillImage } from "@/components/templates/bal/ui/BalFillImage";
import type { BalTable } from "@/types/bal";

type OurTableProps = {
  table: BalTable;
  storeName: string;
  concept: string;
  conceptIsSample?: boolean;
};

export function OurTable({ table, storeName, concept, conceptIsSample }: OurTableProps) {
  return (
    <section id="table" className="bal-section bal-table">
      <div className="bal-shell bal-table-layout">
        <FadeIn className="bal-table-text">
          <h2 className="bal-table-en">
            OUR
            <br />
            TABLE
          </h2>
          <p className="bal-table-title">{table.title}</p>
          {concept ? (
            <p className="bal-table-concept">
              {concept}
              {conceptIsSample ? <SampleLabel /> : null}
            </p>
          ) : null}
          {table.description ? <p className="bal-table-desc">{table.description}</p> : null}
          {table.features.length > 0 ? (
            <ul className="bal-table-features">
              {table.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
          ) : null}
        </FadeIn>

        {table.photos.length > 0 ? (
          <FadeIn delay={0.08} className="bal-snaps-wrap">
            <div className="bal-snaps-arch" aria-hidden />
            <p className="bal-table-stamp" aria-hidden>
              <span>{storeName}</span>
              <strong>TAPAS · VINO</strong>
            </p>
            <div className="bal-snaps">
              {table.photos.map((photo, index) => (
                <figure key={`${photo.src}-${index}`} className={`bal-snap bal-snap--${index + 1}`}>
                  <span className="bal-snap-tape bal-tile" aria-hidden />
                  <div className="bal-snap-photo" style={{ position: "relative", aspectRatio: "4 / 3" }}>
                    <BalFillImage
                      src={photo.src}
                      alt={photo.alt}
                      className="bal-photo object-cover"
                      sizes="(min-width: 1024px) 30rem, 80vw"
                    />
                    {photo.isSample ? <SampleLabel className="demo-sample-label--image" /> : null}
                  </div>
                  <figcaption>{photo.caption || photo.alt}</figcaption>
                </figure>
              ))}
            </div>
          </FadeIn>
        ) : null}
      </div>
    </section>
  );
}
