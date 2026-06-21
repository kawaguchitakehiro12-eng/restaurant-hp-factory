import Link from "next/link";
import { FadeIn } from "@/components/ui/FadeIn";
import { LuxurySection } from "./LuxurySection";
import { LuxurySectionHeading } from "./LuxurySectionHeading";
import type { StoreInfo } from "@/types/luxury-izakaya";

type StoreInfoSectionProps = {
  store: StoreInfo;
};

const infoItems = (store: StoreInfo) => [
  { label: "住所", value: store.address },
  { label: "電話", value: store.phone },
  { label: "営業", value: store.hours.dinner },
  { label: "定休", value: store.hours.closed },
  { label: "アクセス", value: store.access },
];

export function StoreInfo({ store }: StoreInfoSectionProps) {
  return (
    <LuxurySection id="info" narrow>
      <LuxurySectionHeading
        label="Information"
        title="店舗情報"
        subtitle={store.exclusivity}
      />

      <FadeIn className="luxury-info-grid">
        <dl>
          {infoItems(store).map((item) => (
            <div key={item.label} className="luxury-info-row">
              <dt className="luxury-info-label">{item.label}</dt>
              <dd className="luxury-info-value">{item.value}</dd>
            </div>
          ))}
        </dl>

        <div id="reservation" className="luxury-info-reserve">
          <Link href={store.reservationUrl} className="luxury-info-reserve-link">
            御予約のお問い合わせ
          </Link>
        </div>
      </FadeIn>
    </LuxurySection>
  );
}
