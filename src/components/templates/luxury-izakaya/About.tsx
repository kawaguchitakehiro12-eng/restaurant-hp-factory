import { BrandImage } from "@/components/ui/BrandImage";
import { FadeIn } from "@/components/ui/FadeIn";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { LuxuryIzakayaData } from "@/types/luxury-izakaya";

type AboutProps = {
  store: LuxuryIzakayaData["store"];
  aboutImage: string;
};

export function About({ store, aboutImage }: AboutProps) {
  return (
    <Section id="about">
      <SectionHeading
        label="About"
        title="店舗紹介"
        subtitle="西麻布の静けさに、和の美意識を宿す"
      />

      <div className="mt-14 grid items-start gap-12 sm:mt-20 md:grid-cols-2 md:gap-16 lg:gap-24">
        <FadeIn direction="left">
          <BrandImage
            src={aboutImage}
            alt="板前の手仕事"
            aspectClass="aspect-[3/4]"
            sizes="(max-width: 768px) 100vw, 45vw"
          />
        </FadeIn>

        <FadeIn direction="right" delay={0.1} className="flex flex-col gap-10 sm:gap-12 md:pt-8">
          <p className="font-mincho text-[15px] leading-[2.5] tracking-[0.1em] text-ink-muted sm:text-base">
            {store.concept}
          </p>

          <div className="flex flex-col gap-4 border-t border-gold/15 pt-8">
            <p className="font-mincho text-xs tracking-[0.3em] text-ink-muted/60">{store.seats}</p>
            <p className="font-mincho text-xs tracking-[0.25em] text-ink-muted/60">{store.access}</p>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}
