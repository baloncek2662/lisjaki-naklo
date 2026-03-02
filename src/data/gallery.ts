export interface GalleryImage {
  id: string;
  src: string;
  alt: string;
  caption?: string;
}

export interface GalleryEvent {
  id: string;
  slug: string;
  title: string;
  date: string;
  coverImage: string;
  images: GalleryImage[];
}

// Featured images shown directly on the gallery page
export const featuredImages: GalleryImage[] = [
  {
    id: "featured-1",
    src: "/images/gallery/priprave-2025/PXL_20250406_080027286.MP.jpg",
    alt: "",
    caption: "",
  },
  {
    id: "featured-2",
    src: "/images/gallery/priprave-2025/PXL_20250404_140154582.jpg",
    alt: "",
    caption: "",
  },
  {
    id: "featured-3",
    src: "/images/gallery/priprave-2025/PXL_20250405_121531743.jpg",
    alt: "",
    caption: "",
  },
  {
    id: "featured-4",
    src: "/images/gallery/priprave-2025/PXL_20250404_170755603.MP.jpg",
    alt: "",
    caption: "",
  },
];

// Event galleries, folder-like sections
export const galleryEvents: GalleryEvent[] = [
  {
    id: "event-naklani-2026",
    slug: "pripravljalna-tekma-naklani-2026",
    title: "Pripravljalna tekma z Na'Klani",
    date: "2026-02-28",
    coverImage: "",
    images: [],
  },
  {
    id: "event-priprave-2025",
    slug: "priprave-2025",
    title: "Priprave 2025",
    date: "2025-04-04",
    coverImage: "/images/gallery/priprave-2025/PXL_20250406_080027286.MP.jpg",
    images: [
      {
        id: "priprave-1",
        src: "/images/gallery/priprave-2025/PXL_20250406_080027286.MP.jpg",
        alt: "",
      },
      {
        id: "priprave-13",
        src: "/images/gallery/priprave-2025/PXL_20250404_140154582.jpg",
        alt: "",
      },
      {
        id: "priprave-2",
        src: "/images/gallery/priprave-2025/PXL_20250404_140711364.jpg",
        alt: "",
      },
      {
        id: "priprave-3",
        src: "/images/gallery/priprave-2025/PXL_20250404_170755603.MP.jpg",
        alt: "",
      },
      {
        id: "priprave-4",
        src: "/images/gallery/priprave-2025/PXL_20250404_170802207.MP.jpg",
        alt: "",
      },
      {
        id: "priprave-5",
        src: "/images/gallery/priprave-2025/PXL_20250404_170804331.MP.jpg",
        alt: "",
      },
      {
        id: "priprave-6",
        src: "/images/gallery/priprave-2025/PXL_20250405_102941529.MP.jpg",
        alt: "",
      },
      {
        id: "priprave-7",
        src: "/images/gallery/priprave-2025/PXL_20250405_121524262.jpg",
        alt: "",
      },
      {
        id: "priprave-8",
        src: "/images/gallery/priprave-2025/PXL_20250405_121531743.jpg",
        alt: "",
      },
      {
        id: "priprave-9",
        src: "/images/gallery/priprave-2025/PXL_20250405_183644425.MP.jpg",
        alt: "",
      },
      {
        id: "priprave-10",
        src: "/images/gallery/priprave-2025/PXL_20250405_183704974.MP.jpg",
        alt: "",
      },
      {
        id: "priprave-11",
        src: "/images/gallery/priprave-2025/PXL_20250405_184817530.MP.jpg",
        alt: "",
      },
      {
        id: "priprave-12",
        src: "/images/gallery/priprave-2025/PXL_20250406_080009469.MP.jpg",
        alt: "",
      },
    ],
  },
];

export const getGalleryEventBySlug = (slug: string): GalleryEvent | undefined => {
  return galleryEvents.find((event) => event.slug === slug);
};
