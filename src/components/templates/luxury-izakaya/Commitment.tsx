import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { ParallaxImage } from "@/components/ui/ParallaxImage";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { commitments } from "@/data/luxury-izakaya";

export function Commitment() {
  return (
    <section id="commitment" className="section-luxury bg-ink">
      <div className="mx-auto max-w-5xl px-6 sm:px-10 md:px-16">
        <SectionHeading
          label="Commitment"
          title="こだわり"
          subtitle="素材・火・酒"
          light
        />

        <StaggerContainer className="mt-24 flex flex-col gap-32 md:mt-36 md:gap-48">
          {commitments.map((item, index) => (
            <StaggerItem key={item.number} zoom>
              <div
                className={`grid items-center gap-12 md:grid-cols-2 md:gap-20 lg:gap-28 ${
                  index % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
                }`}
              >
                <ParallaxImage
                  src={item.image}
                  alt={item.title}
                  aspectClass="aspect-[5/4]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />

                <div className="flex flex-col gap-8 md:gap-10">
                  <span className="font-mincho text-5xl text-gold/15 md:text-6xl">
                    {item.number}
                  </span>
                  <h3 className="font-mincho text-2xl tracking-[0.3em] text-washi sm:text-3xl">
                    {item.title}
                  </h3>
                  <p className="max-w-sm font-mincho text-sm leading-[2.4] tracking-[0.1em] text-washi/45">
                    {item.description}
                  </p>
                  <span className="h-px w-8 bg-gold/25" aria-hidden />
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
