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
    src: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80",
    alt: "Ekipna fotografija Lisjaki Naklo",
    caption: "Ekipa sezone 2025/26",
  },
  {
    id: "featured-2",
    src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    alt: "Akcija na igrišču",
    caption: "Derbi proti SD Podnart",
  },
  {
    id: "featured-4",
    src: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80",
    alt: "Navijači na tribunah",
    caption: "Naši zvesti navijači",
  },
];

// Event galleries (folder-like sections)
export const galleryEvents: GalleryEvent[] = [
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
        alt: "Priprave 2025",
      },
      {
        id: "priprave-13",
        src: "/images/gallery/priprave-2025/PXL_20250404_140154582.jpg",
        alt: "Priprave 2025",
      },
      {
        id: "priprave-2",
        src: "/images/gallery/priprave-2025/PXL_20250404_140711364.jpg",
        alt: "Priprave 2025",
      },
      {
        id: "priprave-3",
        src: "/images/gallery/priprave-2025/PXL_20250404_170755603.MP.jpg",
        alt: "Priprave 2025",
      },
      {
        id: "priprave-4",
        src: "/images/gallery/priprave-2025/PXL_20250404_170802207.MP.jpg",
        alt: "Priprave 2025",
      },
      {
        id: "priprave-5",
        src: "/images/gallery/priprave-2025/PXL_20250404_170804331.MP.jpg",
        alt: "Priprave 2025",
      },
      {
        id: "priprave-6",
        src: "/images/gallery/priprave-2025/PXL_20250405_102941529.MP.jpg",
        alt: "Priprave 2025",
      },
      {
        id: "priprave-7",
        src: "/images/gallery/priprave-2025/PXL_20250405_121524262.jpg",
        alt: "Priprave 2025",
      },
      {
        id: "priprave-8",
        src: "/images/gallery/priprave-2025/PXL_20250405_121531743.jpg",
        alt: "Priprave 2025",
      },
      {
        id: "priprave-9",
        src: "/images/gallery/priprave-2025/PXL_20250405_183644425.MP.jpg",
        alt: "Priprave 2025",
      },
      {
        id: "priprave-10",
        src: "/images/gallery/priprave-2025/PXL_20250405_183704974.MP.jpg",
        alt: "Priprave 2025",
      },
      {
        id: "priprave-11",
        src: "/images/gallery/priprave-2025/PXL_20250405_184817530.MP.jpg",
        alt: "Priprave 2025",
      },
      {
        id: "priprave-12",
        src: "/images/gallery/priprave-2025/PXL_20250406_080009469.MP.jpg",
        alt: "Priprave 2025",
      },
    ],
  },
  {
    id: "event-1",
    slug: "novoletna-zabava-2024",
    title: "Novoletna zabava 2024",
    date: "2024-12-21",
    coverImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
    images: [
      {
        id: "nz-1",
        src: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
        alt: "Novoletna zabava 2024",
      },
      {
        id: "nz-2",
        src: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&q=80",
        alt: "Praznovanje",
      },
      {
        id: "nz-3",
        src: "https://images.unsplash.com/photo-1504196606672-aef5c9cefc92?w=800&q=80",
        alt: "Druženje članov",
      },
      {
        id: "nz-4",
        src: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&q=80",
        alt: "Glasba in ples",
      },
    ],
  },
  {
    id: "event-2",
    slug: "izlet-stozice-2024",
    title: "Izlet na tekmo Slovenije v Stožicah",
    date: "2024-11-15",
    coverImage: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=80",
    images: [
      {
        id: "st-1",
        src: "https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?w=800&q=80",
        alt: "Stadion Stožice",
      },
      {
        id: "st-2",
        src: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80",
        alt: "Navijanje",
      },
      {
        id: "st-3",
        src: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80",
        alt: "Skupinska fotografija",
      },
    ],
  },
  {
    id: "event-4",
    slug: "poletni-turnir-2024",
    title: "Poletni turnir 2024",
    date: "2024-07-15",
    coverImage: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800&q=80",
    images: [
      {
        id: "pt-1",
        src: "https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=800&q=80",
        alt: "Poletni turnir",
      },
      {
        id: "pt-2",
        src: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&q=80",
        alt: "Ekipna slika",
      },
    ],
  },
];

export const getGalleryEventBySlug = (slug: string): GalleryEvent | undefined => {
  return galleryEvents.find((event) => event.slug === slug);
};
