import { FadeIn } from "@/components/ui/FadeIn";
import { IzakayaLink } from "@/components/templates/izakaya-casual/ui/IzakayaLink";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import { IzakayaSectionHeading } from "@/components/templates/izakaya-casual/ui/IzakayaSectionHeading";
import type { IzakayaCasualStore } from "@/types/izakaya-casual";

type AccessProps = {
  store: IzakayaCasualStore;
};

const infoRows = (store: IzakayaCasualStore) => [
  { label: "住所", value: store.address },
  { label: "電話", value: store.phone },
  { label: "営業", value: store.hours.dinner },
  { label: "定休", value: store.hours.closed },
  { label: "アクセス", value: store.access },
];

export function Access({ store }: AccessProps) {
  const telHref = store.phone
    ? `tel:${store.phone.replace(/[^\d+]/g, "")}`
    : "";

  return (
    <IzakayaSection id="access" narrow>
      <IzakayaSectionHeading label="Access" title="アクセス" align="center" />

      <FadeIn className="izk-info-grid">
        {infoRows(store).map((row) => (
          <div key={row.label} className="izk-info-row">
            <dt className="izk-info-label">{row.label}</dt>
            <dd className="izk-info-value">{row.value}</dd>
          </div>
        ))}

        <div className="izk-info-actions">
          <IzakayaLink
            href={store.reservationUrl}
            variant="lantern"
            label="ご予約"
          />
          {telHref ? (
            <IzakayaLink href={telHref} variant="wood" label="電話する" />
          ) : null}
          {store.instagramUrl ? (
            <IzakayaLink
              href={store.instagramUrl}
              variant="ink"
              label="Instagram"
              external
            />
          ) : null}
        </div>
      </FadeIn>

      {store.mapEmbedUrl ? (
        <FadeIn delay={0.08}>
          <div className="izk-map-wrap">
            <iframe
              src={store.mapEmbedUrl}
              title={`${store.name}の地図`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </FadeIn>
      ) : null}
    </IzakayaSection>
  );
}
