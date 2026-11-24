import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { IzakayaLink } from "@/components/templates/izakaya-casual/ui/IzakayaLink";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import type { IzakayaCasualCourse } from "@/types/izakaya-casual";

type BanquetCoursesProps = {
  courses: IzakayaCasualCourse[];
  reservationUrl: string;
};

export function BanquetCourses({
  courses,
  reservationUrl,
}: BanquetCoursesProps) {
  if (courses.length === 0) return null;

  const featured = courses.find((c) => c.featured) ?? courses[0];
  const others = courses.filter((c) => c.name !== featured.name);

  return (
    <IzakayaSection id="banquet" tone="red" className="izk-banquet">
      <FadeIn className="izk-banquet-hero">
        <p className="izk-banquet-kicker">BANQUET</p>
        <h2 className="izk-banquet-title">宴会、決めちゃおう。</h2>
        <p className="izk-banquet-sub">
          飲み放題つき。幹事さんも迷わず予約できるコースです。
        </p>
      </FadeIn>

      <FadeIn delay={0.06} className="izk-banquet-featured">
        <p className="izk-banquet-feat-label">
          {featured.featured ? "いちばん人気" : "おすすめ"}
        </p>
        <h3 className="izk-banquet-feat-name">{featured.name}</h3>
        <p className="izk-banquet-feat-price">{featured.price}</p>
        <p className="izk-banquet-feat-note">{featured.note}</p>
        {featured.isSample ? <SampleLabel /> : null}
      </FadeIn>

      {others.length > 0 ? (
        <StaggerContainer className="izk-banquet-list">
          {others.map((course) => (
            <StaggerItem key={course.name}>
              <article className="izk-banquet-row">
                <div>
                  <h3 className="izk-banquet-row-name">{course.name}</h3>
                  <p className="izk-banquet-row-note">{course.note}</p>
                </div>
                <p className="izk-banquet-row-price">{course.price}</p>
                {course.isSample ? <SampleLabel /> : null}
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      ) : null}

      <FadeIn delay={0.1} className="izk-banquet-cta">
        <IzakayaLink
          href={reservationUrl}
          variant="ink"
          label="宴会を予約する"
          className="izk-link--on-red"
        />
      </FadeIn>
    </IzakayaSection>
  );
}
