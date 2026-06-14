import { FadeIn } from "@/components/ui/FadeIn";

export function Map() {
  return (
    <section id="map" className="bg-ink pb-24 sm:pb-32 md:pb-40">
      <FadeIn zoom>
        <div className="relative mx-auto max-w-5xl px-6 sm:px-10 md:px-16">
          <div className="relative aspect-[16/10] overflow-hidden sm:aspect-[21/9]">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3241.7479754683747!2d139.7225!3d35.658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzXCsDM5JzI4LjgiTiAxMznCsDQzJzIxLjAiRQ!5e0!3m2!1sja!2sjp!4v1700000000000!5m2!1sja!2sjp"
              title="宵月の地図"
              className="absolute inset-0 h-full w-full opacity-70 grayscale-[40%] contrast-[1.05] sepia-[15%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-gold/10" />
            <div className="pointer-events-none absolute inset-0 bg-ink/20" />
          </div>
        </div>
      </FadeIn>
    </section>
  );
}
