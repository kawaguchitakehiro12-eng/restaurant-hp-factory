import { FadeIn, ParallaxText } from "@/components/ui/FadeIn";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { aboutImage, store } from "@/data/luxury-izakaya";

export function About() {
  return (
    <section id="about" className="section-luxury relative">
      <div className="mx-auto max-w-5xl px-6 sm:px-10 md:px-16">
        <SectionHeading
          label="About"
          title="店舗紹介"
          subtitle="西麻布の静けさに、和の美意識を宿す"
        />

        <div className="mt-20 grid items-center gap-16 md:mt-32 md:grid-cols-[1.1fr_0.9fr] md:gap-24 lg:gap-32">
          <FadeIn direction="left" zoom className="relative md:mt-12">
            <ParallaxImage
              src={aboutImage}
              alt="板前の手仕事"
              aspectClass="aspect-[3/4]"
              sizes="(max-width: 768px) 100vw, 45vw"
            />
          </FadeIn>

          <ParallaxText speed={0.2}>
            <FadeIn direction="right" delay={0.15} className="flex flex-col gap-12 md:gap-16">
              <p className="font-mincho text-base leading-[2.6] tracking-[0.12em] text-ink-muted sm:text-lg">
                {store.concept}
              </p>

              <div className="flex flex-col gap-6">
                <span className="h-px w-10 bg-gold/30" aria-hidden />
                <p className="font-mincho text-xs tracking-[0.4em] text-ink-muted/60">
                  {store.seats}
                </p>
                <p className="font-mincho text-xs tracking-[0.3em] text-ink-muted/60">
                  {store.access}
                </p>
              </div>

              <p
                className="self-end font-mincho text-3xl tracking-[0.5em] text-ink/30"
                style={{ writingMode: "vertical-rl" }}
              >
                一期一会
              </p>
            </FadeIn>
          </ParallaxText>
        </div>
      </div>
    </section>
  );
}
