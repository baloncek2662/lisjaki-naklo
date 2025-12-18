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
    caption: "Ekipa sezone 2024/25",
  },
  {
    id: "featured-2",
    src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
    alt: "Akcija na igrišču",
    caption: "Derbi proti SD Podnart",
  },
  {
    id: "featured-3",
    src: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
    alt: "Proslava po zmagi",
    caption: "Slavje po zmagi",
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
    id: "event-3",
    slug: "zacetek-sezone-2024",
    title: "Začetek sezone 2024/25",
    date: "2024-09-01",
    coverImage: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80",
    images: [
      {
        id: "zs-1",
        src: "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&q=80",
        alt: "Prva tekma sezone",
      },
      {
        id: "zs-2",
        src: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=800&q=80",
        alt: "Priprave na tekmo",
      },
      {
        id: "zs-3",
        src: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800&q=80",
        alt: "Ogrevanje",
      },
      {
        id: "zs-4",
        src: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
        alt: "Akcija na tekmi",
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
