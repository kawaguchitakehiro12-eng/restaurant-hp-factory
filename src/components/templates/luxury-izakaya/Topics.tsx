import { FadeIn } from "@/components/ui/FadeIn";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { LuxurySection } from "./LuxurySection";
import { LuxurySectionHeading } from "./LuxurySectionHeading";
import type { Topic } from "@/types/luxury-izakaya";

type TopicsProps = {
  topics: Topic[];
};

export function Topics({ topics }: TopicsProps) {
  const displayTopics = topics.slice(0, Math.max(3, topics.length));

  return (
    <LuxurySection id="topics" wide>
      <LuxurySectionHeading label="News" title="トピックス" />

      <div className="luxury-topics-grid">
        {displayTopics.map((topic, index) => (
          <FadeIn key={`${topic.title}-${index}`} delay={index * 0.08}>
            <article className="luxury-topic-card">
              <time className="luxury-topic-date">{topic.date}</time>
              <h3 className="luxury-topic-title">{topic.title}</h3>
              {topic.body ? (
                <p className="text-xs leading-relaxed text-ink-muted/55">{topic.body}</p>
              ) : null}
              {topic.isSample ? <SampleLabel /> : null}
            </article>
          </FadeIn>
        ))}
      </div>
    </LuxurySection>
  );
}
