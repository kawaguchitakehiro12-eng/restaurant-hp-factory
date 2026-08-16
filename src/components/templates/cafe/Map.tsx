import { FadeIn } from "@/components/ui/FadeIn";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import type { CafeStore } from "@/types/cafe";

type MapProps = {
  store: CafeStore;
};

export function Map({ store }: MapProps) {
  return (
    <CafeSection id="map" tone="sand" className="cafe-map-section">
      <div className="cafe-map-layout">
        <FadeIn className="cafe-map-intro">
          <p className="cafe-map-kicker">LOCATION</p>
          <h2 className="cafe-map-title">アクセス</h2>
          <p className="cafe-map-address">{store.address}</p>
          {store.access ? (
            <p className="cafe-map-access">{store.access}</p>
          ) : null}
          <div className="cafe-map-meta">
            <span className="cafe-map-meta-label">Hours</span>
            <span className="cafe-map-meta-value">
              {store.hours.weekday}
              {store.hours.weekend && store.hours.weekend !== store.hours.weekday
                ? ` / ${store.hours.weekend}`
                : ""}
            </span>
          </div>
          <div className="cafe-map-rule" aria-hidden />
          <p className="cafe-map-note">
            {store.location}の街角から、静かな午後へ。
          </p>
        </FadeIn>

        <FadeIn delay={0.08} className="cafe-map-frame">
          <div className="cafe-map-wrap">
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
    </CafeSection>
  );
}
