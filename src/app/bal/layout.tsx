import type { Metadata } from "next";
import { getStoreBySlug } from "@/data/stores";
import { isPublished } from "@/lib/stores/helpers";
import {
  buildStoreSeoMetadata,
  DEFAULT_PUBLIC_METADATA,
  resolveSiteBaseUrl,
  storeRecordToSeoInput,
} from "@/lib/stores/store-seo";
import "./bal.css";

const SLUG = "mesa";

export async function generateMetadata(): Promise<Metadata> {
  const store = getStoreBySlug(SLUG);
  if (!store || !isPublished(store)) return DEFAULT_PUBLIC_METADATA;

  const baseUrl = await resolveSiteBaseUrl();
  return buildStoreSeoMetadata(
    storeRecordToSeoInput(store, { canonicalPath: "/bal" }),
    baseUrl
  );
}

export default function BalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
