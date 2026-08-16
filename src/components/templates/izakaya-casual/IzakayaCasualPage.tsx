import { Access } from "./Access";
import { BanquetCourses } from "./BanquetCourses";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { MenuBoard } from "./MenuBoard";
import { MobileCta } from "./MobileCta";
import { News } from "./News";
import { PhotoGallery } from "./PhotoGallery";
import { Space } from "./Space";
import { SpecialtyDishes } from "./SpecialtyDishes";
import { TodaysSpecials } from "./TodaysSpecials";
import type { IzakayaCasualData } from "@/types/izakaya-casual";
import "./izakaya-casual.css";

type IzakayaCasualPageProps = {
  data: IzakayaCasualData;
};

export function IzakayaCasualPage({ data }: IzakayaCasualPageProps) {
  const {
    store,
    heroImage,
    specialtyDishes,
    todaysSpecials,
    menuItems,
    courses,
    space,
    galleryImages,
    topics,
  } = data;

  return (
    <div className="izakaya-casual-template">
      <Header store={store} />
      <Hero
        data={{
          store,
          heroImage,
          heroImageIsSample: data.heroImageIsSample,
          heroImageFit: data.heroImageFit,
          heroObjectPosition: data.heroObjectPosition,
          specialtyDishes,
          menuItems,
        }}
      />
      <main>
        <SpecialtyDishes specialtyDishes={specialtyDishes} />
        <TodaysSpecials todaysSpecials={todaysSpecials} />
        <MenuBoard menuItems={menuItems} />
        <BanquetCourses
          courses={courses}
          reservationUrl={store.reservationUrl}
        />
        <Space space={space} galleryImages={galleryImages} />
        <PhotoGallery galleryImages={galleryImages} />
        <News topics={topics} />
        <Access store={store} />
        <Footer store={store} />
      </main>
      <MobileCta store={store} />
    </div>
  );
}
