/**
 * @deprecated src/data/stores/ を使用してください
 */
import { toLuxuryIzakayaData } from "@/lib/stores/adapters";
import { shogetsuStore } from "@/data/stores/shogetsu";

export const luxuryIzakayaData = toLuxuryIzakayaData(shogetsuStore);

export const store = luxuryIzakayaData.store;
export const useCases = luxuryIzakayaData.useCases;
export const commitments = luxuryIzakayaData.commitments;
export const recommendations = luxuryIzakayaData.recommendations;
export const courses = luxuryIzakayaData.courses;
export const galleryImages = luxuryIzakayaData.galleryImages;
export const topics = luxuryIzakayaData.topics;
export const heroImage = luxuryIzakayaData.heroImage;
export const aboutImage = luxuryIzakayaData.aboutImage;
