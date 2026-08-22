"use client";

import { motion } from "framer-motion";
import { SampleLabel } from "@/components/demo/SampleLabel";
import { IzakayaLink } from "@/components/templates/izakaya-casual/ui/IzakayaLink";
import { IzakayaFillImage } from "@/components/templates/izakaya-casual/ui/IzakayaFillImage";
import type {
  IzakayaCasualData,
  IzakayaCasualMenuItem,
} from "@/types/izakaya-casual";
import {
  heroObjectPositionClass,
  normalizeHeroFit,
  normalizeHeroObjectPosition,
} from "@/types/hero-display";
import { izkPhotoFocusClass } from "@/components/templates/izakaya-casual/utils/izkPhotoFocus";

type HeroProps = {
  data: Pick<
    IzakayaCasualData,
    | "store"
    | "heroImage"
    | "heroImageIsSample"
    | "heroImageFit"
    | "heroObjectPosition"
    | "specialtyDishes"
    | "menuItems"
  >;
};

function walkLabel(access: string): string | null {
  const m = access.match(/徒歩\s*(\d+)\s*分/);
  return m ? `駅徒歩${m[1]}分` : null;
}

function openShort(dinner: string): string {
  const m = dinner.match(/(\d{1,2}:\d{2})/);
  return m ? `${m[1]} OPEN` : dinner;
}

function beerItem(
  items: IzakayaCasualMenuItem[],
): IzakayaCasualMenuItem | undefined {
  return items.find((item) =>
    /生ビール|ビール|draft\s*beer/i.test(`${item.name} ${item.nameEn ?? ""}`),
  );
}

export function Hero({ data }: HeroProps) {
  const { store, heroImage, heroImageIsSample, specialtyDishes, menuItems } =
    data;
  const heroFit = normalizeHeroFit(data.heroImageFit);
  const heroObjectPosition = normalizeHeroObjectPosition(
    data.heroObjectPosition,
  );
  const fitClass = heroFit === "contain" ? "object-contain" : "object-cover";
  /* Admin focal point wins; default center uses food-safe crop */
  const positionClass =
    heroObjectPosition === "center center"
      ? izkPhotoFocusClass("food")
      : heroObjectPositionClass(heroObjectPosition);

  const specialty = specialtyDishes[0];
  const beer = beerItem(menuItems);
  const walk = walkLabel(store.access);
  const open = openShort(store.hours.dinner);

  return (
    <section className="izk-hero">
      <div className="izk-hero-media" style={{ position: "absolute", inset: 0 }}>
        <IzakayaFillImage
          src={heroImage}
          alt={`${store.name}の料理`}
          priority
          className={`izk-image-fill izk-image-fill--hero ${fitClass} ${positionClass}`}
          sizes="100vw"
        />
        {heroImageIsSample ? (
          <SampleLabel className="demo-sample-label--image demo-sample-label--hero" />
        ) : null}
        <div className="izk-hero-media-grade" aria-hidden />
        <div className="izk-hero-media-grain" aria-hidden />
      </div>

      <div className="izk-hero-veil" aria-hidden />

      <div className="izk-hero-body">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08 }}
          className="izk-hero-copy"
        >
          <p className="izk-hero-eyebrow">
            {store.location ? `${store.location} · ` : ""}
            炭火やきとり
          </p>
          <h1 className="izk-hero-name">{store.name}</h1>
          <p className="izk-hero-catch">
            {store.tagline || "今日も旨い酒と飯を。"}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
          className="izk-hero-board"
        >
          <ul className="izk-hero-stats">
            {specialty ? (
              <li>
                <span>名物</span>
                <strong>
                  {specialty.name}
                  <em>{specialty.price}</em>
                </strong>
              </li>
            ) : null}
            {beer ? (
              <li>
                <span>一杯目</span>
                <strong>
                  {beer.name}
                  <em>{beer.price}</em>
                </strong>
              </li>
            ) : null}
            <li>
              <span>営業</span>
              <strong>{open}</strong>
            </li>
            {walk ? (
              <li>
                <span>アクセス</span>
                <strong>{walk}</strong>
              </li>
            ) : null}
          </ul>

          <div className="izk-hero-actions">
            <IzakayaLink
              href={store.reservationUrl}
              variant="lantern"
              label="席を予約する"
            />
            <IzakayaLink href="#specialty" variant="hero" label="名物を見る" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
