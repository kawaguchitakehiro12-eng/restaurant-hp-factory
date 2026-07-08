import { FadeIn } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import { IzakayaSectionHeading } from "@/components/templates/izakaya-casual/ui/IzakayaSectionHeading";
import type { IzakayaCasualSpace } from "@/types/izakaya-casual";

type SpaceProps = {
  space: IzakayaCasualSpace;
};

export function Space({ space }: SpaceProps) {
  if (!space.image && !space.title) return null;

  return (
    <IzakayaSection id="space" tone="wood">
      <IzakayaSectionHeading
        label="Space"
        title="店内"
        subtitle="わいわい話せる、あたたかい空間"
      />

      <div className="izk-space-grid">
        {space.image ? (
          <FadeIn direction="left">
            <figure className="izk-space-photo">
              <FlexibleImageFill
                src={space.image}
                alt={space.title}
                className="izk-image-fill object-cover"
                sizes="(max-width: 768px) 100vw, 55vw"
              />
              {space.isSample ? (
                <SampleLabel className="demo-sample-label--image" />
              ) : null}
            </figure>
          </FadeIn>
        ) : null}

        <FadeIn direction="right" delay={0.08} className="izk-space-body">
          <h3 className="izk-space-title">{space.title}</h3>
          <p className="izk-space-desc">{space.description}</p>
          {space.features.length > 0 ? (
            <div className="izk-space-features">
              {space.features.map((feature) => (
                <p key={feature} className="izk-space-feature">
                  {feature}
                </p>
              ))}
            </div>
          ) : null}
          {space.isSample ? <SampleLabel /> : null}
        </FadeIn>
      </div>
    </IzakayaSection>
  );
}
