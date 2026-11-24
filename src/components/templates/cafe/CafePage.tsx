import { Concept } from "./Concept";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { DrinkMenu, FoodMenu } from "./MenuSections";
import { Map } from "./Map";
import { MobileCta } from "./MobileCta";
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
        {/* milk — editorial story */}
        <Concept
          store={store}
          conceptImage={conceptImage}
          conceptImageIsSample={data.conceptImageIsSample}
          conceptIsSample={data.conceptIsSample}
        />
        {/* ivory — numbered favorites */}
        <PopularMenu popularMenu={popularMenu} />
        {/* mist — food ledger + aside photo */}
        <FoodMenu items={foodMenu} />
        {/* sand — drink board */}
        <DrinkMenu items={drinkMenu} />
        {/* ivory — asymmetric gallery */}
        <PhotoGallery galleryImages={galleryImages} interior={interior} />
        {/* milk — journal */}
        <News topics={topics} />
        {/* mist — visit info */}
        <StoreInfo store={store} />
        {/* sand — map bridge */}
        <Map store={store} />
        <Footer store={store} />
      </main>
      <MobileCta store={store} />
    </div>
  );
}
