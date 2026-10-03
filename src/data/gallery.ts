export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  type?: "image" | "video";
}

export interface GalleryEvent {
  id: string;
  slug: string;
  title: string;
  date: string;
  coverImage: string;
  dateLabel?: string;
  images: GalleryImage[];
}

import records from './content/gallery.json';
export const featuredImages: GalleryImage[] = records.featured as GalleryImage[];
export const galleryEvents: GalleryEvent[] = records.events as GalleryEvent[];
export const getGalleryEventBySlug = (slug: string): GalleryEvent | undefined => galleryEvents.find(event => event.slug === slug);
