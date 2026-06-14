"use client";

import { FadeIn } from "@/components/ui/FadeIn";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { courses } from "@/data/luxury-izakaya";

export function Courses() {
  return (
    <section id="courses" className="section-luxury bg-brown-dark">
      <div className="mx-auto max-w-3xl px-6 sm:px-10 md:px-16">
        <SectionHeading label="Course" title="コース" light />

        <div className="mt-24 flex flex-col gap-0 md:mt-36">
          {courses.map((course, index) => (
            <FadeIn key={course.name} delay={index * 0.12}>
              <article
                className={`group border-t py-10 transition-colors duration-700 sm:py-14 ${
                  course.featured
                    ? "border-gold/30"
                    : "border-washi/8 hover:border-gold/15"
                }`}
              >
                <div className="flex items-baseline justify-between gap-8">
                  <div className="flex flex-col gap-3">
                    <h3
                      className={`font-mincho text-xl tracking-[0.35em] sm:text-2xl ${
                        course.featured ? "text-gold/90" : "text-washi/80"
                      }`}
                    >
                      {course.name}
                    </h3>
                    <p className="font-mincho text-[10px] tracking-[0.3em] text-washi/30">
                      {course.note}
                    </p>
                  </div>

                  <span className="shrink-0 font-en text-xl italic tracking-wider text-gold/70 sm:text-2xl">
                    {course.price}
                  </span>
                </div>
              </article>
            </FadeIn>
          ))}
          <div className="border-t border-washi/8" />
        </div>
      </div>
    </section>
  );
}
