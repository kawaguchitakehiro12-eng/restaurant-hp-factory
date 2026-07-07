import { FadeIn } from "@/components/ui/FadeIn";
import { CafeLink } from "@/components/templates/cafe/ui/CafeLink";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import { CafeSectionHeading } from "@/components/templates/cafe/ui/CafeSectionHeading";
import type { CafeStore } from "@/types/cafe";

type StoreInfoProps = {
  store: CafeStore;
};

const infoRows = (store: CafeStore) => [
  { label: "住所", value: store.address },
  { label: "電話", value: store.phone },
  { label: "平日", value: store.hours.weekday },
  { label: "土日祝", value: store.hours.weekend },
  { label: "定休", value: store.hours.closed },
  { label: "アクセス", value: store.access },
];

export function StoreInfo({ store }: StoreInfoProps) {
  return (
    <CafeSection id="info" narrow>
      <CafeSectionHeading label="Information" title="店舗情報" />

      <FadeIn className="cafe-info-grid">
        {infoRows(store).map((row) => (
          <div key={row.label} className="cafe-info-row">
            <dt className="cafe-info-label">{row.label}</dt>
            <dd className="cafe-info-value">{row.value}</dd>
          </div>
        ))}

        <div className="cafe-info-actions">
          <CafeLink href={store.reservationUrl} label="席のご予約" />
          <CafeLink
            href={store.instagramUrl}
            label={store.instagramHandle || "Instagram"}
            external
          />
        </div>
      </FadeIn>
    </CafeSection>
  );
}
