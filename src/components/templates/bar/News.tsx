import { FadeIn } from "@/components/ui/FadeIn";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { BarSection } from "@/components/templates/bar/ui/BarSection";
import { BarSectionHeading } from "@/components/templates/bar/ui/BarSectionHeading";
import type { BarTopic } from "@/types/bar";

type NewsProps = {
  topics: BarTopic[];
};

export function News({ topics }: NewsProps) {
  if (topics.length === 0) return null;

  return (
    <BarSection id="news" narrow elevated>
      <BarSectionHeading label="News" title="お知らせ" />

      <div className="bar-news-list">
        {topics.map((topic, index) => (
          <FadeIn key={topic.title} delay={index * 0.06}>
            <article className="bar-news-item">
              <div className="bar-news-meta">
                <time className="bar-news-date">{topic.date}</time>
                {topic.category ? (
                  <span className="bar-news-category">{topic.category}</span>
                ) : null}
              </div>
              <div>
                <h3 className="bar-news-title">{topic.title}</h3>
                {topic.isSample ? <SampleLabel /> : null}
              </div>
            </article>
          </FadeIn>
        ))}
      </div>
    </BarSection>
  );
}
