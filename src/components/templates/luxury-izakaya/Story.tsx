import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { StoreInfo } from "@/types/luxury-izakaya";

type StoryProps = {
  store: StoreInfo;
};

export function Story({ store }: StoryProps) {
  return (
    <Section id="story" className="border-t border-ink/5">
      <SectionHeading label="Story" title="宵月のはじまり" />

      <StaggerContainer className="mt-14 flex flex-col gap-10 sm:mt-20 sm:gap-12">
        {store.story.map((paragraph) => (
          <StaggerItem key={paragraph}>
            <p className="font-mincho text-[15px] leading-[2.6] tracking-[0.1em] text-ink-muted sm:text-base">
              {paragraph}
            </p>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <FadeIn delay={0.2} className="mt-14 flex justify-end sm:mt-20">
        <p
          className="font-mincho text-2xl tracking-[0.45em] text-ink/25 sm:text-3xl"
          style={{ writingMode: "vertical-rl" }}
        >
          一期一会
        </p>
      </FadeIn>
    </Section>
  );
}
