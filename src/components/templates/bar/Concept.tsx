import { FadeIn } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { BarSection } from "@/components/templates/bar/ui/BarSection";
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
    <BarSection id="concept" tone="brown" wide>
      <div className="bar-concept">
        <FadeIn className="bar-concept-typo" direction="none">
          <p className="bar-concept-en" aria-hidden>
            After
            <br />
            Dark.
          </p>
          <p className="bar-concept-label">NIGHT</p>
          <div className="bar-concept-rule" aria-hidden />
          {store.hours.dinner ? (
            <p className="bar-concept-hours">{store.hours.dinner}</p>
          ) : null}
        </FadeIn>

        <FadeIn delay={0.08} className="bar-concept-body">
          <p className="bar-heading-label">CONCEPT</p>
          <h2 className="bar-concept-title">コンセプト</h2>
          <p className="bar-concept-lead">{store.tagline}</p>
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

        {conceptImage ? (
          <FadeIn delay={0.12} className="bar-concept-photo-wrap">
            <figure className="bar-concept-photo">
              <FlexibleImageFill
                src={conceptImage}
                alt={`${store.name}のバー空間`}
                className="bar-image-fill object-cover"
                sizes="(max-width: 768px) 100vw, 36vw"
              />
              <div className="bar-photo-grade" aria-hidden />
              <div className="bar-photo-grain" aria-hidden />
              {conceptImageIsSample ? (
                <SampleLabel className="demo-sample-label--image" />
              ) : null}
            </figure>
            <p className="bar-concept-photo-cap">Light & glass</p>
          </FadeIn>
        ) : null}
      </div>
    </BarSection>
  );
}
