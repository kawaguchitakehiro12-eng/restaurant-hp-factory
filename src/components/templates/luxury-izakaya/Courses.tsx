import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { LuxurySection } from "./LuxurySection";
import { LuxurySectionHeading } from "./LuxurySectionHeading";
import type { Course } from "@/types/luxury-izakaya";

type CoursesProps = {
  courses: Course[];
  courseImages?: string[];
};

export function Courses({ courses }: CoursesProps) {
  if (courses.length === 0) return null;

  return (
    <LuxurySection id="courses" wide className="luxury-section--washi">
      <LuxurySectionHeading
        label="Course"
        title="時を重ねる、献立の旅"
        subtitle="一皿ごとに季節が移ろいます"
      />

      <StaggerContainer className="luxury-course-menu">
        {courses.map((course, index) => (
          <StaggerItem key={course.name}>
            <FadeIn delay={index * 0.05}>
              <article
                className={`luxury-course-row ${course.featured ? "luxury-course-row--featured" : ""}`}
              >
                <div className="luxury-course-leader">
                  <div className="luxury-course-leader-main">
                    {course.featured ? (
                      <p className="luxury-course-badge">Signature</p>
                    ) : null}
                    <h3 className="luxury-course-name">{course.name}</h3>
                  </div>
                  <span className="luxury-course-dots" aria-hidden />
                  <p className="luxury-course-price">{course.price}</p>
                </div>
                {course.note ? <p className="luxury-course-note">{course.note}</p> : null}
              </article>
            </FadeIn>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </LuxurySection>
  );
}
