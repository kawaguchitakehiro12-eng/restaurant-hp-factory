import { FadeIn } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { BarSection } from "@/components/templates/bar/ui/BarSection";
import { BarSectionHeading } from "@/components/templates/bar/ui/BarSectionHeading";
import type { BarStore } from "@/types/bar";

type ConceptProps = {
  store: BarStore;
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
    <BarSection id="concept">
      <BarSectionHeading
        label="Concept"
        title="コンセプト"
        subtitle={store.tagline}
      />

      <div className="bar-concept-grid">
        <FadeIn direction="left">
          <figure className="bar-concept-photo">
            <FlexibleImageFill
              src={conceptImage}
              alt={`${store.name}のバー空間`}
              className="bar-image-fill object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {conceptImageIsSample ? (
              <SampleLabel className="demo-sample-label--image" />
            ) : null}
          </figure>
        </FadeIn>

        <FadeIn direction="right" delay={0.1} className="bar-concept-body">
          <p className="bar-concept-text">
            {store.concept}
            {conceptIsSample ? <SampleLabel /> : null}
          </p>

          <ul className="bar-concept-points">
            {store.conceptPoints.map((point) => (
              <li key={point} className="bar-concept-point">
                {point}
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </BarSection>
  );
}
