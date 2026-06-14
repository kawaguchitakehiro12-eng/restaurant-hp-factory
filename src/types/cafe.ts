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
};

export type CafeGalleryImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type CafeTopic = {
  date: string;
  category: string;
  title: string;
};

export type CafeInterior = {
  image: string;
  title: string;
  description: string;
  features: string[];
};

export type CafeData = {
  store: CafeStore;
  heroImage: string;
  conceptImage: string;
  interior: CafeInterior;
  popularMenu: CafeMenuItem[];
  galleryImages: CafeGalleryImage[];
  topics: CafeTopic[];
};
