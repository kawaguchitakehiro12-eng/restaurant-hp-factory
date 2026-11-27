import { FadeIn } from "@/components/ui/FadeIn";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import type { IzakayaCasualTopic } from "@/types/izakaya-casual";

type NewsProps = {
  topics: IzakayaCasualTopic[];
};

export function News({ topics }: NewsProps) {
  if (topics.length === 0) return null;

  return (
    <IzakayaSection id="news" tone="smoke" className="izk-news-section">
      <FadeIn className="izk-news-compact">
        <h2 className="izk-news-title">お知らせ</h2>
        <ul className="izk-news-list">
          {topics.map((topic, index) => (
            <li key={`${topic.title}-${index}`} className="izk-news-item">
              <time className="izk-news-date">{topic.date}</time>
              <span className="izk-news-text">
                {topic.title}
                {topic.isSample ? <SampleLabel /> : null}
              </span>
            </li>
          ))}
        </ul>
      </FadeIn>
    </IzakayaSection>
  );
}
