import { FadeIn } from "@/components/ui/FadeIn";
import { IzakayaLink } from "@/components/templates/izakaya-casual/ui/IzakayaLink";
import { IzakayaSection } from "@/components/templates/izakaya-casual/ui/IzakayaSection";
import type { IzakayaCasualStore } from "@/types/izakaya-casual";

type AccessProps = {
  store: IzakayaCasualStore;
};

function openLine(dinner: string): string {
  const m = dinner.match(/(\d{1,2}:\d{2})/);
  return m ? `${m[1]} OPEN` : dinner;
}

function walkLine(access: string): string | null {
  const m = access.match(/徒歩\s*(\d+)\s*分/);
  return m ? `駅徒歩${m[1]}分` : null;
}

export function Access({ store }: AccessProps) {
  const telHref = store.phone
    ? `tel:${store.phone.replace(/[^\d+]/g, "")}`
    : "";
  const walk = walkLine(store.access);
  const open = openLine(store.hours.dinner);

  return (
    <IzakayaSection id="access" tone="white" className="izk-access-section">
      <div className="izk-access-layout">
        <FadeIn className="izk-access-closing">
          <p className="izk-access-kicker">ACCESS</p>
          <h2 className="izk-access-headline">今夜、ここで。</h2>
          <p className="izk-access-open">{open}</p>
          {walk ? <p className="izk-access-walk">{walk}</p> : null}
          <p className="izk-access-address">{store.address}</p>

          <dl className="izk-access-facts">
            <div>
              <dt>営業</dt>
              <dd>{store.hours.dinner}</dd>
            </div>
            <div>
              <dt>定休</dt>
              <dd>{store.hours.closed}</dd>
            </div>
            <div>
              <dt>電話</dt>
              <dd>
                {telHref ? <a href={telHref}>{store.phone}</a> : store.phone}
              </dd>
            </div>
            <div>
              <dt>駅</dt>
              <dd>{store.access}</dd>
            </div>
          </dl>

          <div id="reservation" className="izk-access-actions">
            <IzakayaLink
              href={store.reservationUrl}
              variant="lantern"
              label="席を予約する"
            />
            {telHref ? (
              <IzakayaLink href={telHref} variant="ink" label="電話する" />
            ) : null}
          </div>
        </FadeIn>

        {store.mapEmbedUrl ? (
          <FadeIn delay={0.08} className="izk-access-map">
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
      </div>
    </IzakayaSection>
  );
}
