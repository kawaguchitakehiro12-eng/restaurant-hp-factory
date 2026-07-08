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
    <IzakayaSection id="banquet" tone="paper">
      <IzakayaSectionHeading
        label="Banquet"
        title="宴会コース"
        subtitle="仲良し飲み会から幹事さんまで、おまかせください"
      />

      <StaggerContainer className="izk-course-grid">
        {courses.map((course) => (
          <StaggerItem key={course.name}>
            <article
              className={`izk-course-card ${course.featured ? "izk-course-card--featured" : ""}`}
            >
              {course.featured ? (
                <span className="izk-course-badge">おすすめ</span>
              ) : null}
              <h3 className="izk-course-name">{course.name}</h3>
              <p className="izk-course-note">{course.note}</p>
              <p className="izk-course-price">{course.price}</p>
              {course.isSample ? <SampleLabel /> : null}
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </IzakayaSection>
  );
}
