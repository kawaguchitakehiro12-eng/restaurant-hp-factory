import { About } from "./About";
import { Commitment } from "./Commitment";
import { Courses } from "./Courses";
import {
  FixedReserveButton,
  MobileReserveBar,
} from "./FixedReserveButton";
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
    <>
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
        <div className="bg-washi pb-[3.25rem] lg:pb-0">
          <main>
            <About store={store} aboutImage={aboutImage} />
            <Story store={store} />
            <UseCases useCases={useCases} />
            <Commitment commitments={commitments} />
            <Recommendations recommendations={recommendations} />
            <Courses courses={courses} />
            <Gallery interiorSpaceImages={interiorSpaceImages} />
            {showPhotoShowcase ? (
              <PhotoShowcase photoShowcaseImages={photoShowcaseImages} />
            ) : null}
            <Topics topics={topics} />
            <StoreInfo store={store} />
            <Map store={store} />
          </main>
          <Footer store={store} />
        </div>
      </div>
      <FixedReserveButton store={store} />
      <MobileReserveBar store={store} />
    </>
  );
}
