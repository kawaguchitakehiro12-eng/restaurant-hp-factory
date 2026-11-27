import type { Metadata } from "next";
import { getStoreBySlug } from "@/data/stores";
import { isPublished } from "@/lib/stores/helpers";
import {
  buildStoreSeoMetadata,
  DEFAULT_PUBLIC_METADATA,
  resolveSiteBaseUrl,
  storeRecordToSeoInput,
} from "@/lib/stores/store-seo";
import "./cafe.css";

const SLUG = "nuee";

export async function generateMetadata(): Promise<Metadata> {
  const store = getStoreBySlug(SLUG);
  if (!store || !isPublished(store)) return DEFAULT_PUBLIC_METADATA;

  const baseUrl = await resolveSiteBaseUrl();
  return buildStoreSeoMetadata(
    storeRecordToSeoInput(store, { canonicalPath: "/cafe" }),
    baseUrl
  );
}

export default function CafeLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
