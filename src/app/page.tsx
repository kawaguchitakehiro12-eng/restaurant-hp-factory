import { toLuxuryIzakayaData } from "@/lib/stores/adapters";
import { isPublished } from "@/lib/stores/helpers";
import { getStoreBySlug } from "@/data/stores";
import { LuxuryIzakayaPage } from "@/components/templates/luxury-izakaya/LuxuryIzakayaPage";
import { notFound } from "next/navigation";

export default function Home() {
  const store = getStoreBySlug("shogetsu");

  if (!store || !isPublished(store)) {
    notFound();
  }

  return <LuxuryIzakayaPage data={toLuxuryIzakayaData(store)} />;
}
