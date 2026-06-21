import { FadeIn } from "@/components/ui/FadeIn";
import type { StoreInfo } from "@/types/luxury-izakaya";

type MapProps = {
  store: StoreInfo;
};

export function Map({ store }: MapProps) {
  return (
    <section id="map" className="luxury-map-section">
      <FadeIn>
        <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-14 lg:px-20 xl:px-24">
          <div className="luxury-map-header">
            <p className="font-en text-[10px] italic tracking-[0.4em] text-gold/50">
              Access
            </p>
            <h2 className="mt-3 font-mincho text-xl tracking-[0.28em] text-washi/85 sm:text-2xl">
              アクセス
            </h2>
            <p className="mt-4 font-mincho text-sm tracking-[0.12em] text-washi/40">
              {store.access}
            </p>
          </div>

          <div className="luxury-map-frame">
            <iframe
              src={store.mapEmbedUrl}
              title={`${store.name}の地図`}
              className="absolute inset-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/15" />
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
