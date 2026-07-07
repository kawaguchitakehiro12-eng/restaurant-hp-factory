import { FadeIn } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import { CafeSectionHeading } from "@/components/templates/cafe/ui/CafeSectionHeading";
import type { CafeStore } from "@/types/cafe";

type ConceptProps = {
  store: CafeStore;
  conceptImage: string;
  conceptImageIsSample?: boolean;
  conceptIsSample?: boolean;
};

export function Concept({
  store,
  conceptImage,
  conceptImageIsSample,
  conceptIsSample,
}: ConceptProps) {
  return (
    <CafeSection id="concept">
      <CafeSectionHeading
        label="Concept"
        title="コンセプト"
        subtitle={store.tagline}
      />

      <div className="cafe-concept-grid">
        <FadeIn direction="left">
          <figure className="cafe-concept-photo">
            <FlexibleImageFill
              src={conceptImage}
              alt={`${store.name}のカフェ空間`}
              className="cafe-image-fill object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {conceptImageIsSample ? (
              <SampleLabel className="demo-sample-label--image" />
            ) : null}
          </figure>
        </FadeIn>

        <FadeIn direction="right" delay={0.1} className="cafe-concept-body">
          <p className="cafe-concept-text">
            {store.concept}
            {conceptIsSample ? <SampleLabel /> : null}
          </p>

          <ul className="cafe-concept-points">
            {store.conceptPoints.map((point) => (
              <li key={point} className="cafe-concept-point">
                {point}
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </CafeSection>
  );
}
