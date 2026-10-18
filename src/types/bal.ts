import type { HeroImageFit, HeroObjectPosition } from "@/types/hero-display";

export type BalStore = {
  name: string;
  nameEn: string;
  location: string;
  tagline: string;
  heroMessage: string;
  concept: string;
  highlights: string[];
  address: string;
  phone: string;
  hours: { dinner: string; closed: string };
  access: string;
  reservationUrl: string;
  instagramUrl: string;
  instagramHandle: string;
  mapEmbedUrl: string;
};

export type BalMenuItem = {
  name: string;
  nameEn?: string;
  price: string;
  description?: string;
  image: string;
  badge?: string;
  isSample?: boolean;
};

export type BalCourse = {
  name: string;
  price: string;
  note: string;
  featured?: boolean;
  isSample?: boolean;
};

export type BalPhoto = {
  src: string;
  alt: string;
  caption?: string;
  isSample?: boolean;
};

export type BalTopic = {
  date: string;
  category: string;
  title: string;
  isSample?: boolean;
};

export type BalHappyHour = {
  time: string;
  offer: string;
  note?: string;
};

export type BalTable = {
  title: string;
  description: string;
  features: string[];
  photos: BalPhoto[];
};

export type BalData = {
  store: BalStore;
  heroImage: string;
  heroImageIsSample?: boolean;
  heroImageFit?: HeroImageFit;
  heroObjectPosition?: HeroObjectPosition;
  heroWindows: BalPhoto[];
  tapas: BalMenuItem[];
  wines: BalMenuItem[];
  boardItems: BalMenuItem[];
  courses: BalCourse[];
  happyHour: BalHappyHour;
  table: BalTable;
  galleryImages: BalPhoto[];
  topics: BalTopic[];
  taglineIsSample?: boolean;
  conceptIsSample?: boolean;
};
