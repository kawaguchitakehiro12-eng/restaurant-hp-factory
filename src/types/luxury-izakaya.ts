export type StoreInfo = {
  name: string;
  nameEn: string;
  location: string;
  exclusivity: string;
  tagline: string;
  heroCopy: string[];
  concept: string;
  story: string[];
  address: string;
  phone: string;
  hours: { dinner: string; closed: string };
  seats: string;
  access: string;
  reservationUrl: string;
  mapEmbedUrl: string;
};

export type UseCase = {
  label: string;
  title: string;
  description: string;
};

export type Commitment = {
  number: string;
  title: string;
  description: string;
  image: string;
  imageIsSample?: boolean;
};

export type MenuItem = {
  name: string;
  price: string;
  image: string;
  description?: string;
  isSample?: boolean;
};

export type Topic = {
  date: string;
  title: string;
  body?: string;
  isSample?: boolean;
};

export type Course = {
  name: string;
  price: string;
  note: string;
  featured?: boolean;
};

export type GalleryImage = {
  src: string;
  alt: string;
  caption?: string;
  isSample?: boolean;
};

export type LuxuryIzakayaData = {
  store: StoreInfo;
  heroImage: string;
  heroImageIsSample?: boolean;
  heroImageFit?: import("@/types/hero-display").HeroImageFit;
  heroObjectPosition?: import("@/types/hero-display").HeroObjectPosition;
  aboutImage: string;
  aboutImageIsSample?: boolean;
  useCases: UseCase[];
  commitments: Commitment[];
  recommendations: MenuItem[];
  courses: Course[];
  galleryImages: GalleryImage[];
  interiorSpaceImages: GalleryImage[];
  photoShowcaseImages: GalleryImage[];
  showPhotoShowcase?: boolean;
  topics: Topic[];
  taglineIsSample?: boolean;
  conceptIsSample?: boolean;
};
