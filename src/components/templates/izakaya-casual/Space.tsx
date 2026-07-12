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
    <IzakayaSection id="space" wide>
      <IzakayaSectionHeading title="店内" variant="plain" align="center" />

      <div className="izk-space-simple">
        {space.image ? (
          <FadeIn>
            <figure className="izk-space-photo">
              <FlexibleImageFill
                src={space.image}
                alt={space.title}
                className="izk-image-fill object-cover"
                sizes="100vw"
              />
              {space.isSample ? (
                <SampleLabel className="demo-sample-label--image" />
              ) : null}
            </figure>
          </FadeIn>
        ) : null}

        <FadeIn delay={0.06} className="izk-space-text">
          <h3 className="izk-space-title">{space.title}</h3>
          <p className="izk-space-desc">{space.description}</p>
          {space.features.length > 0 ? (
            <p className="izk-space-features">{space.features.join("　／　")}</p>
          ) : null}
          {space.isSample ? <SampleLabel /> : null}
        </FadeIn>
      </div>
    </IzakayaSection>
  );
}
