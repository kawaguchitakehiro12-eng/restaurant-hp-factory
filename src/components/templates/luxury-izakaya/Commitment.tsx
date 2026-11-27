import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { LuxurySection } from "./LuxurySection";
import { LuxurySectionHeading } from "./LuxurySectionHeading";
import type { Commitment } from "@/types/luxury-izakaya";

type CommitmentProps = {
  commitments: Commitment[];
};

function photoClassForIndex(index: number): string {
  if (index === 0) return "luxury-commitment-photo--landscape";
  if (index % 2 === 1) return "luxury-commitment-photo--portrait";
  return "";
}

function rowClassForIndex(index: number): string {
  if (index === 0) return "luxury-commitment-row--banner";
  if (index % 2 === 1) return "luxury-commitment-row--reverse";
  return "";
}

export function Commitment({ commitments }: CommitmentProps) {
  return (
    <LuxurySection id="commitment" className="atm-surface atm-surface--ink" dark wide bleed>
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
        <LuxurySectionHeading
          label="Craft"
          title="料理人の技を味わう"
          subtitle="素材・火・酒に宿る、一期の丁寧さ"
          light
        />

        <StaggerContainer className="luxury-commitment-list">
          {commitments.map((item, index) => (
            <StaggerItem key={item.number}>
              <div className={`luxury-commitment-row ${rowClassForIndex(index)}`}>
                <figure
                  className={`luxury-commitment-photo atm-photo-frame ${photoClassForIndex(index)}`}
                >
                  <FlexibleImageFill
                    src={item.image}
                    alt={item.title}
                    className="luxury-image-fill atm-photo"
                    sizes="(max-width: 768px) 100vw, 50vw"
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
          ))}
        </StaggerContainer>
      </div>
    </LuxurySection>
  );
}
