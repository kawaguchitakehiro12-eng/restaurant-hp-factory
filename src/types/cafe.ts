export type CafeStore = {
  name: string;
  nameEn: string;
  location: string;
  tagline: string;
  heroMessage: string;
  concept: string;
  conceptPoints: string[];
  address: string;
  phone: string;
  hours: { weekday: string; weekend: string; closed: string };
  access: string;
  reservationUrl: string;
  instagramUrl: string;
  instagramHandle: string;
  mapEmbedUrl: string;
};

export type CafeMenuItem = {
  name: string;
  nameEn?: string;
  price: string;
  description?: string;
  image: string;
  badge?: string;
  isSample?: boolean;
};

export type CafeGalleryImage = {
  src: string;
  alt: string;
  caption?: string;
  isSample?: boolean;
};

export type CafeTopic = {
  date: string;
  category: string;
  title: string;
  body?: string;
  isSample?: boolean;
};

export type CafeInterior = {
  image: string;
  title: string;
  description: string;
  features: string[];
  isSample?: boolean;
};

export type CafeData = {
  store: CafeStore;
  heroImage: string;
  heroImageIsSample?: boolean;
  conceptImage: string;
  conceptImageIsSample?: boolean;
  interior: CafeInterior;
  popularMenu: CafeMenuItem[];
  galleryImages: CafeGalleryImage[];
  topics: CafeTopic[];
  taglineIsSample?: boolean;
  conceptIsSample?: boolean;
};
