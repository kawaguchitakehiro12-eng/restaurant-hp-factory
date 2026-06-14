import { FadeIn } from "@/components/ui/FadeIn";
import type { StoreInfo } from "@/types/luxury-izakaya";

type MapProps = {
  store: StoreInfo;
};

export function Map({ store }: MapProps) {
  return (
    <section id="map" className="bg-ink pb-16 sm:pb-24 md:pb-32">
      <FadeIn>
        <div className="relative mx-auto max-w-5xl px-5 sm:px-8 md:px-12">
          <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[21/9]">
            <iframe
              src={store.mapEmbedUrl}
              title={`${store.name}の地図`}
              className="absolute inset-0 h-full w-full opacity-70 grayscale-[40%] contrast-[1.05] sepia-[15%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/10" />
            <div className="pointer-events-none absolute inset-0 bg-ink/15" />
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
