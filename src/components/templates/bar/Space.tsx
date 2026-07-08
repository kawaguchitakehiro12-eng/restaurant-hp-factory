import { FadeIn } from "@/components/ui/FadeIn";
import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { BarSection } from "@/components/templates/bar/ui/BarSection";
import { BarSectionHeading } from "@/components/templates/bar/ui/BarSectionHeading";
import type { BarSpace } from "@/types/bar";

type SpaceProps = {
  space: BarSpace;
};

export function Space({ space }: SpaceProps) {
  if (!space.image && !space.title) return null;

  return (
    <BarSection id="space" elevated>
      <BarSectionHeading
        label="Space"
        title="空間"
        subtitle="静寂と灯りが織りなすラウンジ"
      />

      <div className="bar-space-grid">
        <FadeIn direction="left">
          <figure className="bar-space-photo">
            <FlexibleImageFill
              src={space.image}
              alt={space.title}
              className="bar-image-fill object-cover"
              sizes="(max-width: 768px) 100vw, 55vw"
            />
            {space.isSample ? (
              <SampleLabel className="demo-sample-label--image" />
            ) : null}
          </figure>
        </FadeIn>

        <FadeIn direction="right" delay={0.08} className="bar-space-body">
          <h3 className="bar-space-title">{space.title}</h3>
          <p className="bar-space-desc">{space.description}</p>
          {space.features.length > 0 ? (
            <div className="bar-space-features">
              {space.features.map((feature) => (
                <p key={feature} className="bar-space-feature">
                  {feature}
                </p>
              ))}
            </div>
          ) : null}
        </FadeIn>
      </div>
    </BarSection>
  );
}
