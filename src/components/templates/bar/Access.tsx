import { FadeIn } from "@/components/ui/FadeIn";
import { BarLink } from "@/components/templates/bar/ui/BarLink";
import { BarSection } from "@/components/templates/bar/ui/BarSection";
import type { BarStore } from "@/types/bar";

type AccessProps = {
  store: BarStore;
};

export function Access({ store }: AccessProps) {
  const phoneHref = `tel:${store.phone.replace(/[^\d+-]/g, "")}`;

  return (
    <BarSection id="access" tone="charcoal" className="bar-access-section">
      <div className="bar-access-layout">
        <FadeIn className="bar-access-intro">
          <p className="bar-access-kicker">RESERVE</p>
          <h2 className="bar-access-title">アクセス</h2>
          <p className="bar-access-address">{store.address}</p>
          <p className="bar-access-station">{store.access}</p>

          <dl className="bar-access-meta">
            <div className="bar-access-meta-row">
              <dt>Hours</dt>
              <dd>{store.hours.dinner}</dd>
            </div>
            <div className="bar-access-meta-row">
              <dt>Closed</dt>
              <dd>{store.hours.closed}</dd>
            </div>
            <div className="bar-access-meta-row">
              <dt>Phone</dt>
              <dd>
                <a href={phoneHref}>{store.phone}</a>
              </dd>
            </div>
          </dl>

          <div id="reservation" className="bar-access-closing">
            <p className="bar-access-tonight">TONIGHT</p>
            <p className="bar-access-waiting-en">A seat is waiting.</p>
            <p className="bar-access-waiting">
              {store.location}の夜に、静かな席を。
            </p>
            <BarLink
              href={store.reservationUrl}
              variant="gold"
              label="席のご予約"
            />
          </div>
        </FadeIn>

        <FadeIn delay={0.08} className="bar-access-map-col">
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
      </div>
    </BarSection>
  );
}
