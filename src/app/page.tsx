import type { Metadata } from "next";
import { StaticStorePage } from "@/components/public/StaticStorePage";
import { getStoreBySlug } from "@/data/stores";
import { isPublished } from "@/lib/stores/helpers";
import {
  buildStoreSeoMetadata,
  DEFAULT_PUBLIC_METADATA,
  resolveSiteBaseUrl,
  storeRecordToSeoInput,
} from "@/lib/stores/store-seo";

const SLUG = "shogetsu";

export async function generateMetadata(): Promise<Metadata> {
  const store = getStoreBySlug(SLUG);
  if (!store || !isPublished(store)) return DEFAULT_PUBLIC_METADATA;

  const baseUrl = await resolveSiteBaseUrl();
  return buildStoreSeoMetadata(
    storeRecordToSeoInput(store, { canonicalPath: "/" }),
    baseUrl
  );
}

export default function Home() {
  return <StaticStorePage slug={SLUG} />;
}
