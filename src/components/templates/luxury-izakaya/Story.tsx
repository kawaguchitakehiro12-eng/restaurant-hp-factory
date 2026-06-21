import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { LuxurySection } from "./LuxurySection";
import { LuxurySectionHeading } from "./LuxurySectionHeading";
import type { StoreInfo } from "@/types/luxury-izakaya";

type StoryProps = {
  store: StoreInfo;
};

export function Story({ store }: StoryProps) {
  return (
    <LuxurySection id="story" narrow>
      <LuxurySectionHeading label="Story" title={`${store.name}のはじまり`} />

      <StaggerContainer className="luxury-story-list">
        {store.story.map((paragraph) => (
          <StaggerItem key={paragraph}>
            <p className="luxury-story-text">{paragraph}</p>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeIn delay={0.2} className="mt-16 flex justify-center sm:mt-24">
        <p
          className="font-mincho text-xl tracking-[0.45em] text-ink/15 sm:text-2xl"
          style={{ writingMode: "vertical-rl" }}
        >
          一期一会
        </p>
      </FadeIn>
    </LuxurySection>
  );
}
