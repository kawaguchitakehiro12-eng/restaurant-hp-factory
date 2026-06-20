import { Access } from "./Access";
import { Concept } from "./Concept";
import { DesktopCta, MobileCtaBar } from "./CtaBar";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Hero } from "./Hero";
import { Interior } from "./Interior";
import { PhotoGallery } from "./PhotoGallery";
import { PopularMenu } from "./PopularMenu";
import { Topics } from "./Topics";
import type { CafeData } from "@/types/cafe";

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
    galleryImages,
    topics,
  } = data;

  return (
    <div className="template-cafe">
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
      <main className="bg-[var(--cafe-white)] pb-14 lg:pb-0">
        <Concept store={store} conceptImage={conceptImage} />
        <PopularMenu popularMenu={popularMenu} />
        <Interior interior={interior} />
        <PhotoGallery galleryImages={galleryImages} />
        <Topics topics={topics} />
        <Access store={store} />
        <Footer store={store} />
      </main>
      <DesktopCta store={store} />
      <MobileCtaBar store={store} />
    </div>
  );
}
