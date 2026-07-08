import { FadeIn } from "@/components/ui/FadeIn";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import { IzakayaSectionHeading } from "@/components/templates/izakaya-casual/ui/IzakayaSectionHeading";
import type { IzakayaCasualTopic } from "@/types/izakaya-casual";

type NewsProps = {
  topics: IzakayaCasualTopic[];
};

export function News({ topics }: NewsProps) {
  if (topics.length === 0) return null;

  return (
    <IzakayaSection id="news" narrow tone="paper">
      <IzakayaSectionHeading label="News" title="お知らせ" />

      <div className="izk-news-list">
        {topics.map((topic, index) => (
          <FadeIn key={topic.title} delay={index * 0.06}>
            <article className="izk-news-item">
              <div className="izk-news-meta">
                <time className="izk-news-date">{topic.date}</time>
                {topic.category ? (
                  <span className="izk-news-category">{topic.category}</span>
                ) : null}
              </div>
              <div>
                <h3 className="izk-news-title">{topic.title}</h3>
                {topic.isSample ? <SampleLabel /> : null}
              </div>
            </article>
          </FadeIn>
        ))}
      </div>
    </IzakayaSection>
  );
}
