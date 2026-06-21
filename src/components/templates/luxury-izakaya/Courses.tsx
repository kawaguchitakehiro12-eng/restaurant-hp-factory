import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { LuxurySection } from "./LuxurySection";
import { LuxurySectionHeading } from "./LuxurySectionHeading";
import { luxuryCoursePhotoClass } from "./luxury-mosaic";
import type { Course } from "@/types/luxury-izakaya";

type CoursesProps = {
  courses: Course[];
  courseImages?: string[];
};

export function Courses({ courses, courseImages = [] }: CoursesProps) {
  if (courses.length === 0) return null;

  return (
    <LuxurySection id="courses" dark wide bleed>
      <div className="mx-auto max-w-6xl px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
        <LuxurySectionHeading label="Course" title="コース" light />

        <StaggerContainer className="luxury-course-cards mt-12 sm:mt-16">
          {courses.map((course, index) => {
            const image = courseImages[index % Math.max(courseImages.length, 1)];
            const cardClass = luxuryCoursePhotoClass(index);

            return (
              <StaggerItem key={course.name}>
                <FadeIn delay={index * 0.05}>
                  <article className={`luxury-course-card ${cardClass}`}>
                    {image ? (
                      <figure className="luxury-course-card-photo">
                        <FlexibleImageFill
                          src={image}
                          alt={course.name}
                          className="luxury-image-fill"
                          sizes="(max-width: 768px) 100vw, 40vw"
                        />
                        <div className="luxury-course-card-photo-overlay" />
                      </figure>
                    ) : null}

                    <div className="luxury-course-card-body">
                      {course.featured ? (
                        <p className="luxury-course-card-badge">Signature</p>
                      ) : null}
                      <h3 className="luxury-course-card-name">{course.name}</h3>
                      <p className="luxury-course-card-note">{course.note}</p>
                      <p className="luxury-course-card-price">{course.price}</p>
                    </div>
                  </article>
                </FadeIn>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </LuxurySection>
  );
}
