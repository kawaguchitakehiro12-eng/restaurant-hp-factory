import { FlexibleImageFill } from "@/components/ui/FlexibleImageFill";
import { FadeIn } from "@/components/ui/FadeIn";
import { LuxurySection } from "./LuxurySection";
import { LuxurySectionHeading } from "./LuxurySectionHeading";
import type { LuxuryIzakayaData } from "@/types/luxury-izakaya";

type AboutProps = {
  store: LuxuryIzakayaData["store"];
  aboutImage: string;
};

export function About({ store, aboutImage }: AboutProps) {
  return (
    <LuxurySection id="about" wide bleed>
      <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
        <LuxurySectionHeading
          label="About"
          title="店舗紹介"
          subtitle={store.tagline || undefined}
        />
      </div>

      <div className="luxury-about-editorial mt-12 px-4 sm:mt-16 sm:px-6 md:px-10">
        <FadeIn direction="left">
          <div className="luxury-about-photo-main">
            <FlexibleImageFill
              src={aboutImage}
              alt={`${store.name}の店内`}
              className="luxury-image-fill"
              sizes="(max-width: 768px) 100vw, 55vw"
              priority
            />
          </div>
        </FadeIn>

        <FadeIn direction="right" delay={0.1} className="luxury-about-copy">
          <p className="luxury-about-text">{store.concept}</p>

          <div className="luxury-about-meta">
            <div>
              <p className="luxury-about-meta-label">Seats</p>
              <p className="luxury-about-meta-value">{store.seats}</p>
            </div>
            <div>
              <p className="luxury-about-meta-label">Access</p>
              <p className="luxury-about-meta-value">{store.access}</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </LuxurySection>
  );
}
