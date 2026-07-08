import { Access } from "./Access";
import { Concept } from "./Concept";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { News } from "./News";
import { PhotoGallery } from "./PhotoGallery";
import { SignatureDrinks } from "./SignatureDrinks";
import { FoodSnacks } from "./FoodSnacks";
import { Space } from "./Space";
import type { BarData } from "@/types/bar";
import "./bar.css";

type BarPageProps = {
  data: BarData;
};

export function BarPage({ data }: BarPageProps) {
  const {
    store,
    heroImage,
    conceptImage,
    space,
    signatureDrinks,
    foodSnacks,
    galleryImages,
    topics,
  } = data;

  return (
    <div className="bar-template">
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
        <SignatureDrinks signatureDrinks={signatureDrinks} />
        <FoodSnacks foodSnacks={foodSnacks} />
        <Space space={space} />
        <PhotoGallery galleryImages={galleryImages} />
        <News topics={topics} />
        <Access store={store} />
        <Footer store={store} />
      </main>
    </div>
  );
}
