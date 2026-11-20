export type IzakayaCasualStore = {
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
  mapEmbedUrl: string;
};

export type IzakayaCasualMenuItem = {
  name: string;
  nameEn?: string;
  price: string;
  description?: string;
  image: string;
  badge?: string;
  isSample?: boolean;
};

export type IzakayaCasualCourse = {
  name: string;
  price: string;
  note: string;
  featured?: boolean;
  isSample?: boolean;
};

export type IzakayaCasualGalleryImage = {
  src: string;
  alt: string;
  caption?: string;
  isSample?: boolean;
};

export type IzakayaCasualTopic = {
  date: string;
  category: string;
  title: string;
  isSample?: boolean;
};

export type IzakayaCasualSpace = {
  image: string;
  title: string;
  description: string;
  features: string[];
  isSample?: boolean;
};

export type IzakayaCasualData = {
  store: IzakayaCasualStore;
  heroImage: string;
  heroImageIsSample?: boolean;
  heroImageFit?: import("@/types/hero-display").HeroImageFit;
  heroObjectPosition?: import("@/types/hero-display").HeroObjectPosition;
  specialtyDishes: IzakayaCasualMenuItem[];
  todaysSpecials: IzakayaCasualMenuItem[];
  menuItems: IzakayaCasualMenuItem[];
  courses: IzakayaCasualCourse[];
  space: IzakayaCasualSpace;
  galleryImages: IzakayaCasualGalleryImage[];
  topics: IzakayaCasualTopic[];
  taglineIsSample?: boolean;
  conceptIsSample?: boolean;
};
