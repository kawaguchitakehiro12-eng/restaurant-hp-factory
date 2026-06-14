import { About } from "@/components/templates/luxury-izakaya/About";
import { Commitment } from "@/components/templates/luxury-izakaya/Commitment";
import { Courses } from "@/components/templates/luxury-izakaya/Courses";
import {
  FixedReserveButton,
  MobileReserveBar,
} from "@/components/templates/luxury-izakaya/FixedReserveButton";
import { Footer } from "@/components/templates/luxury-izakaya/Footer";
import { Gallery } from "@/components/templates/luxury-izakaya/Gallery";
import { Header } from "@/components/templates/luxury-izakaya/Header";
import { Hero } from "@/components/templates/luxury-izakaya/Hero";
import { Map } from "@/components/templates/luxury-izakaya/Map";
import { Recommendations } from "@/components/templates/luxury-izakaya/Recommendations";
import { StoreInfo } from "@/components/templates/luxury-izakaya/StoreInfo";
import { Topics } from "@/components/templates/luxury-izakaya/Topics";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <div className="relative z-10">
        <div className="h-[100svh]" aria-hidden />
        <div className="bg-washi">
          <main>
            <About />
            <Commitment />
            <Recommendations />
            <Courses />
            <Gallery />
            <Topics />
            <StoreInfo />
            <Map />
          </main>
          <Footer />
        </div>
      </div>
      <FixedReserveButton />
      <MobileReserveBar />
    </>
  );
}
