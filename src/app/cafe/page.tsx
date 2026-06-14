import { CafePage } from "@/components/templates/cafe/CafePage";
import { toCafeData } from "@/lib/stores/adapters";
import { isPublished } from "@/lib/stores/helpers";
import { getStoreBySlug } from "@/data/stores";
import { notFound } from "next/navigation";

export default function CafeTemplatePage() {
  const store = getStoreBySlug("nuee");

  if (!store || !isPublished(store)) {
    notFound();
  }

  return <CafePage data={toCafeData(store)} />;
}
