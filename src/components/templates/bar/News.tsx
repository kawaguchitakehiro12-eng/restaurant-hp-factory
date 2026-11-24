import { FadeIn } from "@/components/ui/FadeIn";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { BarSection } from "@/components/templates/bar/ui/BarSection";
import type { BarTopic } from "@/types/bar";

type NewsProps = {
  topics: BarTopic[];
};

export function News({ topics }: NewsProps) {
  if (topics.length === 0) return null;

  return (
    <BarSection id="news" tone="brown">
      <FadeIn className="bar-news-head">
        <p className="bar-news-kicker">NIGHT NOTES</p>
        <h2 className="bar-news-heading">お知らせ</h2>
        <div className="bar-news-rule" aria-hidden />
      </FadeIn>

      <div className="bar-news-list">
        {topics.map((topic, index) => (
          <FadeIn key={`${topic.title}-${index}`} delay={index * 0.05}>
            <article className="bar-news-item">
              <time className="bar-news-date">{topic.date}</time>
              {topic.category ? (
                <span className="bar-news-category">{topic.category}</span>
              ) : (
                <span className="bar-news-category bar-news-category--empty" />
              )}
              <h3 className="bar-news-title">
                {topic.title}
                {topic.isSample ? <SampleLabel /> : null}
              </h3>
            </article>
          </FadeIn>
        ))}
      </div>
    </BarSection>
  );
}
