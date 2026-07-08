export type BarStore = {
  name: string;
  nameEn: string;
  location: string;
  tagline: string;
  heroCopy: string[];
  concept: string;
  conceptPoints: string[];
  address: string;
  phone: string;
  hours: { dinner: string; closed: string };
  access: string;
  reservationUrl: string;
  instagramUrl: string;
  mapEmbedUrl: string;
};

export type BarMenuItem = {
  name: string;
  nameEn?: string;
  price: string;
  description?: string;
  image: string;
  badge?: string;
  isSample?: boolean;
};

export type BarGalleryImage = {
  src: string;
  alt: string;
  caption?: string;
  isSample?: boolean;
};

export type BarTopic = {
  date: string;
  category: string;
  title: string;
  isSample?: boolean;
};

export type BarSpace = {
  image: string;
  title: string;
  description: string;
  features: string[];
  isSample?: boolean;
};

export type BarData = {
  store: BarStore;
  heroImage: string;
  heroImageIsSample?: boolean;
  heroImageFit?: import("@/types/hero-display").HeroImageFit;
  heroObjectPosition?: import("@/types/hero-display").HeroObjectPosition;
  conceptImage: string;
  conceptImageIsSample?: boolean;
  space: BarSpace;
  signatureDrinks: BarMenuItem[];
  foodSnacks: BarMenuItem[];
  galleryImages: BarGalleryImage[];
  topics: BarTopic[];
  taglineIsSample?: boolean;
  conceptIsSample?: boolean;
};
