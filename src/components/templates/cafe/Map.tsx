import { FadeIn } from "@/components/ui/FadeIn";
import { CafeSection } from "@/components/templates/cafe/ui/CafeSection";
import { CafeSectionHeading } from "@/components/templates/cafe/ui/CafeSectionHeading";
import type { CafeStore } from "@/types/cafe";

type MapProps = {
  store: CafeStore;
};

export function Map({ store }: MapProps) {
  return (
    <CafeSection id="map" narrow beige>
      <CafeSectionHeading label="Access" title="アクセス" align="center" />

      <FadeIn>
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
    </CafeSection>
  );
}
