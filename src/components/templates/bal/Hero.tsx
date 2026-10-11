import { SampleLabel } from "@/components/demo/SampleLabel";
import { BalFillImage } from "@/components/templates/bal/ui/BalFillImage";
import { openTime, walkMinutes } from "@/components/templates/bal/nav";
import type { BalData, BalPhoto } from "@/types/bal";
import {
  heroObjectPositionClass,
  normalizeHeroFit,
  normalizeHeroObjectPosition,
} from "@/types/hero-display";

type HeroProps = {
  data: Pick<
    BalData,
    | "store"
    | "heroImage"
    | "heroImageIsSample"
    | "heroImageFit"
    | "heroObjectPosition"
    | "heroWindows"
    | "happyHour"
    | "taglineIsSample"
  >;
};

function TypeWindow({
  photo,
  shape,
}: {
  photo?: BalPhoto;
  shape: "pill" | "circle";
}) {
  return (
    <div
      className={`bal-win bal-win--${shape} ${photo?.src ? "" : "bal-tile bal-tile--terracotta"}`}
      style={{ position: "relative" }}
      aria-hidden
    >
      {photo?.src ? (
        <BalFillImage
          src={photo.src}
          alt=""
          className="bal-photo object-cover"
          sizes="(min-width: 1024px) 18rem, 40vw"
        />
      ) : null}
    </div>
  );
}

export function Hero({ data }: HeroProps) {
  const { store, heroImage, heroImageIsSample, heroWindows, happyHour } = data;
  const fitClass = normalizeHeroFit(data.heroImageFit) === "contain" ? "object-contain" : "object-cover";
  const positionClass = heroObjectPositionClass(
    normalizeHeroObjectPosition(data.heroObjectPosition)
  );
  const walk = walkMinutes(store.access);
  const open = openTime(store.hours.dinner);
  const highlight = store.highlights[0];

  return (
    <section className="bal-hero" aria-labelledby="bal-hero-title">
      <div className="bal-shell bal-hero-stage">
        <div className="bal-hero-type">
          <div className="bal-hero-line bal-hero-line--1">
            VINO
            <TypeWindow photo={heroWindows[0]} shape="pill" />
          </div>
          <div className="bal-hero-line bal-hero-line--2">
            <TypeWindow photo={heroWindows[1]} shape="circle" />
            TAPAS
            <span className="bal-hero-amp" aria-hidden>
              &amp;
            </span>
          </div>
          <div className="bal-hero-line bal-hero-line--3">
            <span>GOOD</span> <span>NIGHT.</span>
          </div>
        </div>

        <div className="bal-hero-arch" style={{ position: "relative" }}>
          <div className="bal-hero-arch-frame" style={{ position: "absolute", inset: 0 }}>
            <BalFillImage
              src={heroImage}
              alt={`${store.name}のテーブル`}
              priority
              className={`bal-photo ${fitClass} ${positionClass}`}
              sizes="(min-width: 1024px) 26vw, 100vw"
            />
            {heroImageIsSample ? (
              <SampleLabel className="demo-sample-label--image demo-sample-label--hero" />
            ) : null}
          </div>
          {happyHour.time ? (
            <p className="bal-hero-stamp">
              <span>HAPPY</span>
              <span>HOUR</span>
              <strong>{happyHour.time.replace(/\s+/g, "")}</strong>
            </p>
          ) : null}
        </div>
      </div>

      <div className="bal-shell bal-hero-strip">
        <div className="bal-hero-intro">
          <h1 id="bal-hero-title" className="bal-hero-name">
            {store.name}
            {store.nameEn ? <span>{store.nameEn}</span> : null}
          </h1>
          <p className="bal-hero-catch">
            {store.tagline}
            {data.taglineIsSample ? <SampleLabel /> : null}
          </p>
          {store.heroMessage ? <p className="bal-hero-msg">{store.heroMessage}</p> : null}
        </div>

        <div className="bal-hero-side">
          <ul className="bal-hero-facts">
            <li>
              <span>OPEN</span>
              <strong>{open}</strong>
            </li>
            {walk ? (
              <li>
                <span>{store.location || "STATION"}</span>
                <strong>徒歩{walk}分</strong>
              </li>
            ) : null}
            {highlight ? (
              <li>
                <span>POINT</span>
                <strong>{highlight}</strong>
              </li>
            ) : null}
          </ul>
          <div className="bal-hero-actions">
            <a href={store.reservationUrl} className="bal-btn bal-btn--bordeaux">
              席を予約する
            </a>
            <a href="#tapas" className="bal-btn bal-btn--line">
              メニューを見る
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
