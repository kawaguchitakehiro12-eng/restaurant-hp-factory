import { FadeIn } from "@/components/ui/FadeIn";
import { ReserveLink } from "@/components/ui/ReserveLink";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { store } from "@/data/luxury-izakaya";

const infoItems = [
  { label: "住所", value: store.address },
  { label: "電話", value: store.phone },
  { label: "営業", value: store.hours.dinner },
  { label: "定休", value: store.hours.closed },
];

export function StoreInfo() {
  return (
    <section id="info" className="section-luxury">
      <div className="mx-auto max-w-3xl px-6 sm:px-10 md:px-16">
        <SectionHeading
          label="Information"
          title="店舗情報"
          subtitle="完全予約制"
        />

        <FadeIn className="mt-20 sm:mt-28">
          <dl className="flex flex-col">
            {infoItems.map((item) => (
              <div
                key={item.label}
                className="grid grid-cols-[72px_1fr] gap-6 border-b border-ink/8 py-7 sm:grid-cols-[100px_1fr] sm:py-9"
              >
                <dt className="font-mincho text-[11px] tracking-[0.4em] text-gold/60">
                  {item.label}
                </dt>
                <dd className="font-mincho text-sm leading-[2] tracking-[0.1em] text-ink/70">
                  {item.value}
                </dd>
              </div>
            ))}
          </dl>

          <div id="reservation" className="mt-16 sm:mt-24">
            <ReserveLink href={store.reservationUrl} variant="section" />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
