import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { LuxurySection } from "./LuxurySection";
import { LuxurySectionHeading } from "./LuxurySectionHeading";
import type { Commitment } from "@/types/luxury-izakaya";

type CommitmentProps = {
  commitments: Commitment[];
};

export function Commitment({ commitments }: CommitmentProps) {
  return (
    <LuxurySection id="commitment" className="bg-brown-dark" wide bleed>
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
        <LuxurySectionHeading
          label="Commitment"
          title="こだわり"
          subtitle="素材・火・酒"
          light
        />

        <StaggerContainer className="luxury-commitment-list">
          {commitments.map((item, index) => {
            const isReversed = index % 2 === 1;

            return (
              <StaggerItem key={item.number}>
                <div
                  className={`luxury-commitment-row ${isReversed ? "luxury-commitment-row--reverse" : ""}`}
                >
                  <figure className="luxury-commitment-photo">
                    <FlexibleImageFill
                      src={item.image}
                      alt={item.title}
                      className="luxury-image-fill"
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                    {item.imageIsSample ? (
                      <SampleLabel className="demo-sample-label--image" />
                    ) : null}
                  </figure>

                  <div className="luxury-commitment-text">
                    <span className="luxury-commitment-num">{item.number}</span>
                    <h3 className="luxury-commitment-title">{item.title}</h3>
                    <p className="luxury-commitment-desc">{item.description}</p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </LuxurySection>
  );
}

