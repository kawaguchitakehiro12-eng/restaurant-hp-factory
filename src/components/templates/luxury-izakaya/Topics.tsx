import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { topics } from "@/data/luxury-izakaya";

export function Topics() {
  return (
    <section id="topics" className="section-luxury border-t border-ink/5">
      <div className="mx-auto max-w-3xl px-6 sm:px-10 md:px-16">
        <SectionHeading label="News" title="トピックス" />

        <div className="mt-20 flex flex-col sm:mt-28">
          {topics.map((topic, index) => (
            <FadeIn key={topic.title} delay={index * 0.1}>
              <article className="group border-b border-ink/8 py-8 transition-colors duration-500 hover:border-gold/15 sm:py-10">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-baseline sm:gap-12">
                  <time className="shrink-0 font-en text-xs italic tracking-wider text-ink-muted/50">
                    {topic.date}
                  </time>
                  <h3 className="font-mincho text-sm leading-[2] tracking-[0.15em] text-ink/70 transition-colors duration-500 group-hover:text-gold/80 sm:text-base">
                    {topic.title}
                  </h3>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
