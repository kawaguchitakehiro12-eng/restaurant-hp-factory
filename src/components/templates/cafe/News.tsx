import { FadeIn } from "@/components/ui/FadeIn";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import { CafeSectionHeading } from "@/components/templates/cafe/ui/CafeSectionHeading";
import type { CafeTopic } from "@/types/cafe";

type NewsProps = {
  topics: CafeTopic[];
};

export function News({ topics }: NewsProps) {
  if (topics.length === 0) return null;

  return (
    <CafeSection id="news" narrow warm>
      <CafeSectionHeading label="News" title="お知らせ" />

      <div className="cafe-news-list">
        {topics.map((topic, index) => (
          <FadeIn key={topic.title} delay={index * 0.06}>
            <article className="cafe-news-item">
              <div className="cafe-news-meta">
                <time className="cafe-news-date">{topic.date}</time>
                {topic.category ? (
                  <span className="cafe-news-category">{topic.category}</span>
                ) : null}
              </div>
              <div>
                <h3 className="cafe-news-title">{topic.title}</h3>
                {topic.isSample ? <SampleLabel /> : null}
              </div>
            </article>
          </FadeIn>
        ))}
      </div>
    </CafeSection>
  );
}
