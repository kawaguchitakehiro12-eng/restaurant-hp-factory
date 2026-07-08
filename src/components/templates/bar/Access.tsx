import { FadeIn } from "@/components/ui/FadeIn";
import { BarLink } from "@/components/templates/bar/ui/BarLink";
import { BarSection } from "@/components/templates/bar/ui/BarSection";
import { BarSectionHeading } from "@/components/templates/bar/ui/BarSectionHeading";
import type { BarStore } from "@/types/bar";

type AccessProps = {
  store: BarStore;
};

const infoRows = (store: BarStore) => [
  { label: "住所", value: store.address },
  { label: "電話", value: store.phone },
  { label: "営業", value: store.hours.dinner },
  { label: "定休", value: store.hours.closed },
  { label: "アクセス", value: store.access },
];

export function Access({ store }: AccessProps) {
  return (
    <BarSection id="access" narrow>
      <BarSectionHeading label="Access" title="アクセス" align="center" />

      <FadeIn className="bar-info-grid">
        {infoRows(store).map((row) => (
          <div key={row.label} className="bar-info-row">
            <dt className="bar-info-label">{row.label}</dt>
            <dd className="bar-info-value">{row.value}</dd>
          </div>
        ))}

        <div className="bar-info-actions">
          <BarLink href={store.reservationUrl} variant="gold" label="席のご予約" />
          <BarLink
            href={store.instagramUrl}
            label="Instagram"
            external
          />
        </div>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div className="bar-map-wrap">
          <iframe
            src={store.mapEmbedUrl}
            title={`${store.name}の地図`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </FadeIn>
    </BarSection>
  );
}
