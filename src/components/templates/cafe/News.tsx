import { FadeIn } from "@/components/ui/FadeIn";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import type { CafeTopic } from "@/types/cafe";

type NewsProps = {
  topics: CafeTopic[];
};

function splitDate(date: string): { primary: string; secondary: string } {
  const parts = date.replace(/\//g, ".").split(".");
  if (parts.length >= 2) {
    return {
      primary: parts[parts.length - 1] || date,
      secondary: parts.slice(0, -1).join("."),
    };
  }
  return { primary: date, secondary: "" };
}

export function News({ topics }: NewsProps) {
  if (topics.length === 0) return null;

  return (
    <CafeSection id="news" tone="milk">
      <div className="cafe-news-layout">
        <div className="cafe-news-shell">
          <FadeIn className="cafe-news-head">
            <p className="cafe-news-kicker">JOURNAL</p>
            <h2 className="cafe-news-heading">お知らせ</h2>
            <p className="cafe-news-lead">季節の一杯と、小さな更新。</p>
            <div className="cafe-news-rule" aria-hidden />
          </FadeIn>

          <div className="cafe-news-list">
            {topics.map((topic, index) => {
              const { primary, secondary } = splitDate(topic.date);
              return (
                <FadeIn key={`${topic.title}-${index}`} delay={index * 0.05}>
                  <article className="cafe-news-item">
                    <div className="cafe-news-dateblock">
                      {secondary ? (
                        <span className="cafe-news-date-sec">{secondary}</span>
                      ) : null}
                      <time className="cafe-news-date-pri">{primary}</time>
                    </div>
                    <div className="cafe-news-body">
                      {topic.category ? (
                        <span className="cafe-news-category">{topic.category}</span>
                      ) : null}
                      <h3 className="cafe-news-title">{topic.title}</h3>
                      {topic.body ? (
                        <p className="cafe-news-excerpt">{topic.body}</p>
                      ) : null}
                      {topic.isSample ? <SampleLabel /> : null}
                    </div>
                  </article>
                </FadeIn>
              );
            })}
          </div>
        </div>

        <aside className="cafe-news-aside" aria-hidden>
          <div className="cafe-news-aside-anchor">
            <p className="cafe-news-aside-bg">Notes</p>
            <p className="cafe-news-aside-meta">
              <span className="cafe-news-aside-count">
                {String(topics.length).padStart(2, "0")}
              </span>
              <span className="cafe-news-aside-label">ENTRIES</span>
            </p>
          </div>
          <p className="cafe-news-aside-vert">UPDATE</p>
        </aside>
      </div>
    </CafeSection>
  );
}
