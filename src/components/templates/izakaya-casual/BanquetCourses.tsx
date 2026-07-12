import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import { IzakayaSectionHeading } from "@/components/templates/izakaya-casual/ui/IzakayaSectionHeading";
import type { IzakayaCasualCourse } from "@/types/izakaya-casual";

type BanquetCoursesProps = {
  courses: IzakayaCasualCourse[];
};

export function BanquetCourses({ courses }: BanquetCoursesProps) {
  if (courses.length === 0) return null;

  return (
    <IzakayaSection id="banquet" tone="wood">
      <IzakayaSectionHeading
        title="宴会コース"
        subtitle="幹事さんも気軽にどうぞ"
        variant="minimal"
      />

      <StaggerContainer className="izk-course-plain">
        {courses.map((course) => (
          <StaggerItem key={course.name}>
            <article className="izk-course-plain-row">
              <div className="izk-course-plain-copy">
                {course.featured ? (
                  <span className="izk-course-plain-tag">おすすめ</span>
                ) : null}
                <h3 className="izk-course-plain-name">{course.name}</h3>
                <p className="izk-course-plain-note">{course.note}</p>
              </div>
              <p className="izk-course-plain-price">{course.price}</p>
              {course.isSample ? <SampleLabel /> : null}
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </IzakayaSection>
  );
}
