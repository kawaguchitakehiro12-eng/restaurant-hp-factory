import { FadeIn } from "@/components/ui/FadeIn";
import { ReserveLink } from "@/components/ui/ReserveLink";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { StoreInfo } from "@/types/luxury-izakaya";

type StoreInfoSectionProps = {
  store: StoreInfo;
};

const infoItems = (store: StoreInfo) => [
  { label: "住所", value: store.address },
  { label: "電話", value: store.phone },
  { label: "営業", value: store.hours.dinner },
  { label: "定休", value: store.hours.closed },
];

export function StoreInfo({ store }: StoreInfoSectionProps) {
  return (
    <Section id="info" narrow>
      <SectionHeading
        label="Information"
        title="店舗情報"
        subtitle="完全予約制"
      />

      <FadeIn className="mt-14 sm:mt-20">
        <dl>
          {infoItems(store).map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[64px_1fr] gap-4 border-b border-ink/8 py-6 sm:grid-cols-[88px_1fr] sm:py-7"
            >
              <dt className="font-mincho text-[11px] tracking-[0.35em] text-gold/55">
                {item.label}
              </dt>
              <dd className="font-mincho text-sm leading-[2] tracking-[0.08em] text-ink/70">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div id="reservation" className="mt-10 sm:mt-14">
          <ReserveLink href={store.reservationUrl} variant="section" />
        </div>
      </FadeIn>
    </Section>
  );
}
