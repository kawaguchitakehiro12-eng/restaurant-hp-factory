import { About } from "./About";
import { Commitment } from "./Commitment";
import { Courses } from "./Courses";
import { FixedReserveButton, MobileReserveBar } from "./FixedReserveButton";
import { Footer } from "./Footer";
import { Gallery } from "./Gallery";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Map } from "./Map";
import { PhotoShowcase } from "./PhotoShowcase";
import { Recommendations } from "./Recommendations";
import { StoreInfo } from "./StoreInfo";
import { Story } from "./Story";
import { Topics } from "./Topics";
import { UseCases } from "./UseCases";
import type { LuxuryIzakayaData } from "@/types/luxury-izakaya";
import "./luxury-izakaya.css";

type LuxuryIzakayaPageProps = {
  data: LuxuryIzakayaData;
};

export function LuxuryIzakayaPage({ data }: LuxuryIzakayaPageProps) {
  const {
    store,
    heroImage,
    aboutImage,
    useCases,
    commitments,
    recommendations,
    courses,
    interiorSpaceImages,
    photoShowcaseImages,
    showPhotoShowcase,
    topics,
  } = data;

  return (
    <div className="luxury-template">
      <Header store={store} showPhotoShowcase={showPhotoShowcase} />
      <Hero
        data={{
          store,
          heroImage,
          heroImageIsSample: data.heroImageIsSample,
          heroImageFit: data.heroImageFit,
          heroObjectPosition: data.heroObjectPosition,
        }}
      />
      <div className="relative z-10">
        <div className="h-[100svh]" aria-hidden />
        <div className="bg-washi atm-surface atm-surface--warm">
          <main>
            {/* 白っぽい和紙 */}
            <About store={store} aboutImage={aboutImage} />
            {/* 少し深い和紙 */}
            <Story store={store} />
            {/* 淡い紙の余白（旧・黒帯を廃止） */}
            <UseCases useCases={useCases} />
            {/* 唯一の深い墨 — 技の章 */}
            <Commitment commitments={commitments} />
            {/* 白い紙 — 料理主役 */}
            <Recommendations recommendations={recommendations} />
            {/* 和紙 — 献立表 */}
            <Courses courses={courses} />
            {/* 白 */}
            <Gallery interiorSpaceImages={interiorSpaceImages} />
            {showPhotoShowcase ? (
              <PhotoShowcase photoShowcaseImages={photoShowcaseImages} />
            ) : null}
            {/* 浅い霧の紙 */}
            <Topics topics={topics} />
            {/* 和紙 */}
            <StoreInfo store={store} />
            {/* 締めの墨 */}
            <Map store={store} />
          </main>
          <Footer store={store} />
        </div>
      </div>
      <FixedReserveButton store={store} />
      <MobileReserveBar store={store} />
    </div>
  );
}
