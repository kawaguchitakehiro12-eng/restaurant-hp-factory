import { SampleLabel } from "@/components/demo/SampleLabel";
import { FadeIn } from "@/components/ui/FadeIn";
import type { BalTopic } from "@/types/bal";

type NewsProps = {
  topics: BalTopic[];
};

export function News({ topics }: NewsProps) {
  if (topics.length === 0) return null;

  return (
    <section id="news" className="bal-section bal-news">
      <div className="bal-shell bal-news-layout">
        <FadeIn className="bal-news-head">
          <h2 className="bal-news-title">NEWS</h2>
          <p className="bal-news-ja">お知らせ</p>
        </FadeIn>
        <FadeIn delay={0.06}>
          <ul className="bal-news-list">
            {topics.map((topic, index) => (
              <li key={`${topic.date}-${index}`} className="bal-news-item">
                <span className="bal-news-date">{topic.date}</span>
                {topic.category ? <span className="bal-news-cat">{topic.category}</span> : null}
                <p className="bal-news-text">
                  {topic.title}
                  {topic.isSample ? <SampleLabel /> : null}
                </p>
              </li>
            ))}
          </ul>
        </FadeIn>
      </div>
    </section>
  );
}
