import { BrandImage } from "@/components/ui/BrandImage";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Commitment } from "@/types/luxury-izakaya";

type CommitmentProps = {
  commitments: Commitment[];
};

export function Commitment({ commitments }: CommitmentProps) {
  return (
    <Section id="commitment" className="bg-brown-dark">
      <SectionHeading
        label="Commitment"
        title="こだわり"
        subtitle="素材・火・酒"
        light
      />

      <StaggerContainer className="mt-14 flex flex-col gap-20 sm:mt-20 sm:gap-28 md:gap-36">
        {commitments.map((item, index) => (
          <StaggerItem key={item.number}>
            <div
              className={`grid items-start gap-10 md:grid-cols-2 md:gap-16 lg:gap-20 ${
                index % 2 === 1 ? "md:[&>*:first-child]:order-2" : ""
              }`}
            >
              <div className="relative">
                <BrandImage
                  src={item.image}
                  alt={item.title}
                  aspectClass="aspect-[5/4]"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {item.imageIsSample ? (
                  <SampleLabel className="demo-sample-label--image" />
                ) : null}
              </div>

              <div className="flex flex-col gap-6 md:gap-8 md:pt-4">
                <span className="font-mincho text-4xl text-gold/12 sm:text-5xl">
                  {item.number}
                </span>
                <h3 className="font-mincho text-xl tracking-[0.25em] text-washi sm:text-2xl">
                  {item.title}
                </h3>
                <p className="max-w-xs font-mincho text-[13px] leading-[2.4] tracking-[0.08em] text-washi/40 sm:text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </Section>
  );
}
