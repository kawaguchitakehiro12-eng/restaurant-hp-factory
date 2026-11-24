import { FadeIn } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { BarSection } from "@/components/templates/bar/ui/BarSection";
import { BarSectionHeading } from "@/components/templates/bar/ui/BarSectionHeading";
import type { BarGalleryImage, BarSpace } from "@/types/bar";

type SpaceProps = {
  space: BarSpace;
  detailImages?: BarGalleryImage[];
};

type SpaceStat = { label: string; value: string };

function extractStats(features: string[]): SpaceStat[] {
  const stats: SpaceStat[] = [];
  const joined = features.join(" ");

  const seats = joined.match(/(?:全)?\s*(\d+)\s*席/);
  if (seats) stats.push({ label: "SEATS", value: seats[1] });

  const counter =
    joined.match(/カウンター\s*(\d+)/) ||
    joined.match(/(\d+)\s*席?[^\n]*カウンター/);
  if (counter) {
    stats.push({ label: "COUNTER", value: counter[1] });
  }

  const priv = joined.match(/個室\s*(\d+)/);
  if (priv) stats.push({ label: "PRIVATE", value: priv[1] });
  else if (/個室/.test(joined)) stats.push({ label: "PRIVATE", value: "—" });

  return stats.slice(0, 3);
}

export function Space({ space, detailImages = [] }: SpaceProps) {
  if (!space.image && !space.title) return null;

  const stats = extractStats(space.features);
  const detail = detailImages.filter((img) => img.src && img.src !== space.image).slice(0, 2);

  return (
    <BarSection id="space" tone="walnut" wide className="bar-space-section">
      <BarSectionHeading
        label="SPACE"
        title="空間"
        subtitle="静寂と灯りが織りなすラウンジ"
        largeEn="Lounge"
        align="left"
      />

      <div className="bar-space">
        <div className="bar-space-visual">
          {space.image ? (
            <FadeIn>
              <figure className="bar-space-hero">
                <FlexibleImageFill
                  src={space.image}
                  alt={space.title || "空間"}
                  className="bar-image-fill object-cover"
                  sizes="(max-width: 768px) 100vw, 70vw"
                />
                <div className="bar-photo-grade" aria-hidden />
                <div className="bar-photo-grain" aria-hidden />
                {space.isSample ? (
                  <SampleLabel className="demo-sample-label--image" />
                ) : null}
              </figure>
            </FadeIn>
          ) : (
            <div className="bar-space-hero bar-space-hero--empty" aria-hidden>
              <p>SPACE</p>
            </div>
          )}

          {detail.length > 0 ? (
            <div className="bar-space-details">
              {detail.map((image) => (
                <FadeIn key={image.src} delay={0.06}>
                  <figure className="bar-space-detail">
                    <FlexibleImageFill
                      src={image.src}
                      alt={image.alt}
                      className="bar-image-fill object-cover"
                      sizes="(max-width: 768px) 45vw, 18vw"
                    />
                    {image.isSample ? (
                      <SampleLabel className="demo-sample-label--image" />
                    ) : null}
                  </figure>
                </FadeIn>
              ))}
            </div>
          ) : null}
        </div>

        <FadeIn delay={0.08} className="bar-space-body">
          <h3 className="bar-space-title">{space.title}</h3>
          <p className="bar-space-desc">{space.description}</p>

          {stats.length > 0 ? (
            <div className="bar-space-stats">
              {stats.map((stat) => (
                <div key={stat.label} className="bar-space-stat">
                  <p className="bar-space-stat-label">{stat.label}</p>
                  <p className="bar-space-stat-value">{stat.value}</p>
                </div>
              ))}
            </div>
          ) : null}

          {space.features.length > 0 ? (
            <ul className="bar-space-features">
              {space.features.map((feature) => (
                <li key={feature} className="bar-space-feature">
                  {feature}
                </li>
              ))}
            </ul>
          ) : null}
        </FadeIn>
      </div>
    </BarSection>
  );
}
