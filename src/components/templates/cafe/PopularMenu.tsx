import { StaggerContainer, StaggerItem } from "@/components/ui/FadeIn";
import { CafeImage } from "@/components/templates/cafe/ui/CafeImage";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import { CafeSectionHeading } from "@/components/templates/cafe/ui/CafeSectionHeading";
import { SampleLabel } from "@/components/demo/SampleLabel";
import type { CafeMenuItem } from "@/types/cafe";

type PopularMenuProps = {
  popularMenu: CafeMenuItem[];
};

export function PopularMenu({ popularMenu }: PopularMenuProps) {
  return (
    <CafeSection id="menu" cream>
      <CafeSectionHeading
        label="Menu"
        title="人気メニュー"
        subtitle="Instagramでも人気の定番"
      />

      <StaggerContainer className="mt-12 flex flex-col gap-14 sm:mt-16 sm:gap-16 md:grid md:grid-cols-3 md:gap-8 lg:gap-10">
        {popularMenu.map((item) => (
          <StaggerItem key={item.name}>
            <article className="flex flex-col gap-4">
              <div className="relative">
                <CafeImage
                  src={item.image}
                  alt={item.name}
                  aspectClass="aspect-[4/5]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  rounded
                />
                {item.badge && (
                  <span className="absolute left-3 top-3 bg-[var(--cafe-white)]/90 px-2.5 py-1 text-[10px] tracking-[0.15em] text-[var(--cafe-accent)] backdrop-blur-sm">
                    {item.badge}
                  </span>
                )}
                {item.isSample ? (
                  <SampleLabel className="demo-sample-label--image" />
                ) : null}
              </div>
              <div className="flex flex-col gap-1.5 px-0.5">
                {item.nameEn && (
                  <p
                    className="text-[10px] tracking-[0.12em] text-[var(--cafe-muted)]"
                    style={{ fontFamily: "var(--font-cafe-en)" }}
                  >
                    {item.nameEn}
                  </p>
                )}
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-base tracking-[0.08em] text-[var(--cafe-ink)] sm:text-lg">
                    {item.name}
                  </h3>
                  <span
                    className="shrink-0 text-sm text-[var(--cafe-accent)]"
                    style={{ fontFamily: "var(--font-cafe-en)" }}
                  >
                    {item.price}
                  </span>
                </div>
                {item.description && (
                  <p className="text-[12px] leading-[1.9] tracking-[0.03em] text-[var(--cafe-muted)] sm:text-[13px]">
                    {item.description}
                  </p>
                )}
                {item.isSample ? <SampleLabel /> : null}
              </div>
            </article>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </CafeSection>
  );
}
