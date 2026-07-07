import { Concept } from "./Concept";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { DrinkMenu, FoodMenu } from "./MenuSections";
import { Map } from "./Map";
import { News } from "./News";
import { PhotoGallery } from "./PhotoGallery";
import { PopularMenu } from "./PopularMenu";
import { StoreInfo } from "./StoreInfo";
import type { CafeData } from "@/types/cafe";
import "./cafe.css";

type CafePageProps = {
  data: CafeData;
};

export function CafePage({ data }: CafePageProps) {
  const {
    store,
    heroImage,
    conceptImage,
    interior,
    popularMenu,
    foodMenu,
    drinkMenu,
    galleryImages,
    topics,
  } = data;

  return (
    <div className="cafe-template">
      <Header store={store} />
      <Hero
        data={{
          store,
          heroImage,
          heroImageIsSample: data.heroImageIsSample,
          heroImageFit: data.heroImageFit,
          heroObjectPosition: data.heroObjectPosition,
        }}
      />
      <main>
        <Concept
          store={store}
          conceptImage={conceptImage}
          conceptImageIsSample={data.conceptImageIsSample}
          conceptIsSample={data.conceptIsSample}
        />
        <PopularMenu popularMenu={popularMenu} />
        <FoodMenu items={foodMenu} />
        <DrinkMenu items={drinkMenu} />
        <PhotoGallery galleryImages={galleryImages} interior={interior} />
        <News topics={topics} />
        <StoreInfo store={store} />
        <Map store={store} />
        <Footer store={store} />
      </main>
    </div>
  );
}
