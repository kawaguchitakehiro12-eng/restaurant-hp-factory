import { FadeIn } from "@/components/ui/FadeIn";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Topic } from "@/types/luxury-izakaya";

type TopicsProps = {
  topics: Topic[];
};

export function Topics({ topics }: TopicsProps) {
  return (
    <Section id="topics" className="border-t border-ink/5" narrow>
      <SectionHeading label="News" title="トピックス" />

      <div className="mt-14 sm:mt-20">
        {topics.map((topic, index) => (
          <FadeIn key={topic.title} delay={index * 0.08}>
            <article className="border-b border-ink/8 py-7 sm:py-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-10">
                <time className="shrink-0 font-en text-xs italic tracking-wider text-ink-muted/45">
                  {topic.date}
                </time>
                <h3 className="font-mincho text-sm leading-[2] tracking-[0.12em] text-ink/65 sm:text-base">
                  {topic.title}
                </h3>
              </div>
            </article>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}
