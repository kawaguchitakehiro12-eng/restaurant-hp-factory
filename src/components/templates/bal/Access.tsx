import { FadeIn } from "@/components/ui/FadeIn";
import { telHref } from "@/components/templates/bal/nav";
import type { BalStore } from "@/types/bal";

type AccessProps = {
  store: BalStore;
};

export function Access({ store }: AccessProps) {
  const tel = telHref(store.phone);

  return (
    <section id="access" className="bal-access">
      <div className="bal-shell">
        <FadeIn>
          <p className="bal-access-big">
            <span>SEE YOU</span> <span>TONIGHT.</span>
          </p>
        </FadeIn>

        <div className="bal-access-layout">
          <FadeIn className="bal-access-card">
            <p className="bal-eyebrow">ACCESS</p>
            <h2 className="bal-access-name">{store.name}</h2>
            <p className="bal-access-address">{store.address}</p>
            <dl className="bal-access-facts">
              <div>
                <dt>営業時間</dt>
                <dd>{store.hours.dinner}</dd>
              </div>
              <div>
                <dt>定休日</dt>
                <dd>{store.hours.closed}</dd>
              </div>
              <div>
                <dt>電話</dt>
                <dd>{tel ? <a href={tel}>{store.phone}</a> : store.phone}</dd>
              </div>
              <div>
                <dt>アクセス</dt>
                <dd>{store.access}</dd>
              </div>
            </dl>
            <div id="reservation" className="bal-access-actions">
              <a href={store.reservationUrl} className="bal-btn bal-btn--bordeaux">
                席を予約する
              </a>
              {tel ? (
                <a href={tel} className="bal-btn bal-btn--ink">
                  電話で予約
                </a>
              ) : null}
            </div>
          </FadeIn>

          {store.mapEmbedUrl ? (
            <FadeIn delay={0.08} className="bal-access-map">
              <iframe
                src={store.mapEmbedUrl}
                title={`${store.name}の地図`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </FadeIn>
          ) : null}
        </div>
      </div>
    </section>
  );
}
