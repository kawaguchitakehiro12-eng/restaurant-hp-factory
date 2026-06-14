import { LuxuryIzakayaPage } from "@/components/templates/luxury-izakaya/LuxuryIzakayaPage";
import { luxuryIzakayaData } from "@/data/luxury-izakaya";

export default function Home() {
  return <LuxuryIzakayaPage data={luxuryIzakayaData} />;
}
