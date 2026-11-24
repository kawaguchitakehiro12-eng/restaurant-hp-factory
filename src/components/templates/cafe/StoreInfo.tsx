import { FadeIn } from "@/components/ui/FadeIn";
import { CafeLink } from "@/components/templates/cafe/ui/CafeLink";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import { CafeSectionHeading } from "@/components/templates/cafe/ui/CafeSectionHeading";
import type { CafeStore } from "@/types/cafe";

type StoreInfoProps = {
  store: CafeStore;
};

const infoRows = (store: CafeStore) =>
  [
    { label: "Address", ja: "住所", value: store.address },
    { label: "Phone", ja: "電話", value: store.phone },
    { label: "Weekday", ja: "平日", value: store.hours.weekday },
    { label: "Weekend", ja: "土日祝", value: store.hours.weekend },
    { label: "Closed", ja: "定休", value: store.hours.closed },
    { label: "Access", ja: "アクセス", value: store.access },
  ].filter((row) => Boolean(row.value));

export function StoreInfo({ store }: StoreInfoProps) {
  return (
    <CafeSection id="info" tone="mist">
      <div className="cafe-info-layout">
        <CafeSectionHeading
          label="LOCATION"
          title="店舗情報"
          largeEn="Visit"
          align="left"
        />

        <FadeIn className="cafe-info-panel">
          <dl className="cafe-info-list">
            {infoRows(store).map((row) => (
              <div key={row.label} className="cafe-info-row">
                <dt className="cafe-info-label">
                  <span className="cafe-info-label-en">{row.label}</span>
                  <span className="cafe-info-label-ja">{row.ja}</span>
                </dt>
                <dd className="cafe-info-value">{row.value}</dd>
              </div>
            ))}
          </dl>

          <div id="reservation" className="cafe-info-actions">
            <CafeLink href={store.reservationUrl} label="席のご予約" />
            {store.instagramUrl ? (
              <CafeLink
                href={store.instagramUrl}
                label={store.instagramHandle || "Instagram"}
                external
              />
            ) : null}
          </div>
        </FadeIn>
      </div>
    </CafeSection>
  );
}
