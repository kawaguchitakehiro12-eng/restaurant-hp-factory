"use client";

import { useEffect } from "react";
import {
  buildStoreSeoTags,
  storeRecordToSeoInput,
} from "@/lib/stores/store-seo";
import type { StoreRecord } from "@/types/store";

type StoreSeoHeadProps = {
  store: StoreRecord;
  isDemo?: boolean;
  canonicalPath?: string;
};

function upsertMeta(
  selector: string,
  attrs: Record<string, string>,
  createTag: "meta" | "link" = "meta"
): void {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement(createTag);
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([key, value]) => {
    el!.setAttribute(key, value);
  });
}

function setMetaByName(name: string, content: string): void {
  upsertMeta(`meta[name="${name}"]`, { name, content });
}

function setMetaByProperty(property: string, content: string): void {
  upsertMeta(`meta[property="${property}"]`, { property, content });
}

export function StoreSeoHead({ store, isDemo = false, canonicalPath }: StoreSeoHeadProps) {
  useEffect(() => {
    const input = storeRecordToSeoInput(store, { isDemo, canonicalPath });
    const baseUrl = typeof window !== "undefined" ? window.location.origin : undefined;
    const tags = buildStoreSeoTags(input, baseUrl);

    document.title = tags.title;
    setMetaByName("description", tags.description);
    setMetaByProperty("og:title", tags.ogTitle);
    setMetaByProperty("og:description", tags.ogDescription);
    setMetaByProperty("og:type", "website");
    setMetaByProperty("og:locale", "ja_JP");
    setMetaByName("twitter:card", tags.twitterCard);
    setMetaByName("twitter:title", tags.ogTitle);
    setMetaByName("twitter:description", tags.ogDescription);

    if (tags.ogImage) {
      setMetaByProperty("og:image", tags.ogImage);
      setMetaByName("twitter:image", tags.ogImage);
    }

    if (canonicalPath && baseUrl) {
      upsertMeta(
        'link[rel="canonical"]',
        { rel: "canonical", href: `${baseUrl}${canonicalPath}` },
        "link"
      );
    }
  }, [store, isDemo, canonicalPath]);

  return null;
}
