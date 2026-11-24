import { Access } from "./Access";
import { Footer } from "./Footer";
import { Gallery } from "./Gallery";
import { HappyHour } from "./HappyHour";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { MobileCta } from "./MobileCta";
import { News } from "./News";
import { OurTable } from "./OurTable";
import { Tapas } from "./Tapas";
import { TodaysBoard } from "./TodaysBoard";
import { Wine } from "./Wine";
import type { BalData } from "@/types/bal";
import "./bal.css";

type BalPageProps = {
  data: BalData;
};

export function BalPage({ data }: BalPageProps) {
  const { store } = data;

  return (
    <div className="bal-template">
      <Header store={store} />
      <main>
        <Hero data={data} />
        <Tapas tapas={data.tapas} />
        <Wine wines={data.wines} />
        <TodaysBoard boardItems={data.boardItems} courses={data.courses} />
        <HappyHour happyHour={data.happyHour} />
        <OurTable
          table={data.table}
          storeName={store.name}
          concept={store.concept}
          conceptIsSample={data.conceptIsSample}
        />
        <Gallery
          galleryImages={data.galleryImages}
          instagramUrl={store.instagramUrl}
          instagramHandle={store.instagramHandle}
        />
        <News topics={data.topics} />
        <Access store={store} />
      </main>
      <Footer store={store} />
      <MobileCta store={store} />
    </div>
  );
}
