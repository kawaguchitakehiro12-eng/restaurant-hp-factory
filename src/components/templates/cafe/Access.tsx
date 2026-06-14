import { FadeIn } from "@/components/ui/FadeIn";
import { CafeLink } from "@/components/templates/cafe/ui/CafeLink";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import { CafeSectionHeading } from "@/components/templates/cafe/ui/CafeSectionHeading";
import type { CafeStore } from "@/types/cafe";

type AccessProps = {
  store: CafeStore;
};

const infoItems = (store: CafeStore) => [
  { label: "住所", value: store.address },
  { label: "電話", value: store.phone },
  { label: "平日", value: store.hours.weekday },
  { label: "土日祝", value: store.hours.weekend },
  { label: "定休", value: store.hours.closed },
  { label: "アクセス", value: store.access },
];

export function Access({ store }: AccessProps) {
  return (
    <CafeSection id="access" narrow>
      <CafeSectionHeading label="Access" title="アクセス" />

      <FadeIn className="mt-12 sm:mt-16">
        <dl>
          {infoItems(store).map((item) => (
            <div
              key={item.label}
              className="grid grid-cols-[72px_1fr] gap-4 border-b border-[var(--cafe-cream)] py-5 sm:grid-cols-[96px_1fr] sm:py-6"
            >
              <dt className="text-[11px] tracking-[0.2em] text-[var(--cafe-accent)]">
                {item.label}
              </dt>
              <dd className="text-sm leading-[2] tracking-[0.03em] text-[var(--cafe-ink)]/75">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <div id="reservation" className="mt-8 flex flex-col items-center gap-6 sm:mt-10">
          <CafeLink
            href={store.reservationUrl}
            variant="section"
            label="席のご予約"
            sublabel="カフェタイムのご予約はこちら"
          />
          <CafeLink
            href={store.instagramUrl}
            variant="text"
            label={store.instagramHandle}
          />
        </div>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-12 sm:mt-16">
        <div className="relative aspect-[16/10] overflow-hidden rounded-sm sm:aspect-[21/9]">
          <iframe
            src={store.mapEmbedUrl}
            title={`${store.name}の地図`}
            className="absolute inset-0 h-full w-full opacity-90"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </FadeIn>
    </CafeSection>
  );
}
