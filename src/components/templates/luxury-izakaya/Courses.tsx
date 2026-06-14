import { FadeIn } from "@/components/ui/FadeIn";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Course } from "@/types/luxury-izakaya";

type CoursesProps = {
  courses: Course[];
};

export function Courses({ courses }: CoursesProps) {
  return (
    <Section id="courses" dark narrow>
      <SectionHeading label="Course" title="コース" light />

      <div className="mt-14 sm:mt-20">
        {courses.map((course, index) => (
          <FadeIn key={course.name} delay={index * 0.08}>
            <article
              className={`border-t py-8 sm:py-10 ${
                course.featured ? "border-gold/25" : "border-washi/8"
              }`}
            >
              <div className="flex items-baseline justify-between gap-6">
                <div className="flex flex-col gap-2">
                  <h3
                    className={`font-mincho text-lg tracking-[0.3em] sm:text-xl ${
                      course.featured ? "text-gold/85" : "text-washi/80"
                    }`}
                  >
                    {course.name}
                  </h3>
                  <p className="font-mincho text-[10px] tracking-[0.25em] text-washi/30">
                    {course.note}
                  </p>
                </div>
                <span className="shrink-0 font-en text-lg italic tracking-wider text-gold/65 sm:text-xl">
                  {course.price}
                </span>
              </div>
            </article>
          </FadeIn>
        ))}
        <div className="border-t border-washi/8" />
      </div>
    </Section>
  );
}
