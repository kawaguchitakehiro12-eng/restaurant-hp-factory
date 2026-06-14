import { FadeIn } from "@/components/ui/FadeIn";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import { CafeSectionHeading } from "@/components/templates/cafe/ui/CafeSectionHeading";
import type { CafeTopic } from "@/types/cafe";

type TopicsProps = {
  topics: CafeTopic[];
};

export function Topics({ topics }: TopicsProps) {
  return (
    <CafeSection id="topics" narrow>
      <CafeSectionHeading label="Topics" title="トピックス" />

      <div className="mt-12 sm:mt-16">
        {topics.map((topic, index) => (
          <FadeIn key={topic.title} delay={index * 0.08}>
            <article className="border-b border-[var(--cafe-cream)] py-6 sm:py-7">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
                <div className="flex items-center gap-3">
                  <time
                    className="text-[11px] tracking-[0.08em] text-[var(--cafe-muted)]"
                    style={{ fontFamily: "var(--font-cafe-en)" }}
                  >
                    {topic.date}
                  </time>
                  <span className="border border-[var(--cafe-accent)]/30 px-2 py-0.5 text-[10px] tracking-[0.12em] text-[var(--cafe-accent)]">
                    {topic.category}
                  </span>
                </div>
                <h3 className="text-sm leading-[1.9] tracking-[0.04em] text-[var(--cafe-ink)]/75 sm:text-[15px]">
                  {topic.title}
                </h3>
              </div>
            </article>
          </FadeIn>
        ))}
      </div>
    </CafeSection>
  );
}
