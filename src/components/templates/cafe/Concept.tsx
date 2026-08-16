import { FadeIn } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
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
    <CafeSection id="concept" tone="milk" wide>
      <div className="cafe-concept">
        <FadeIn className="cafe-concept-typo" direction="none">
          <p className="cafe-concept-en" aria-hidden>
            A place
            <br />
            to slow
            <br />
            down.
          </p>
          <p className="cafe-concept-label">OUR STORY</p>
        </FadeIn>

        <FadeIn delay={0.08} className="cafe-concept-body">
          <h2 className="cafe-concept-title">コンセプト</h2>
          <p className="cafe-concept-lead">{store.tagline}</p>
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

        <FadeIn delay={0.12} className="cafe-concept-photo-wrap" direction="up">
          <figure className="cafe-concept-photo">
            <FlexibleImageFill
              src={conceptImage}
              alt={`${store.name}のカフェ空間`}
              className="cafe-image-fill object-cover"
              sizes="(max-width: 768px) 100vw, 40vw"
            />
            {conceptImageIsSample ? (
              <SampleLabel className="demo-sample-label--image" />
            ) : null}
          </figure>
          <p className="cafe-concept-photo-caption">Space & light</p>
        </FadeIn>
      </div>
    </CafeSection>
  );
}
