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
    coverImage: "/images/gallery/pripravljalna-tekma-naklani-2026/IMG-3de65e6e3714cbee583f0f3e0a4ded46-V.jpg",
    images: [
      { id: "naklani-1",  src: "/images/gallery/pripravljalna-tekma-naklani-2026/PXL_20260228_105820108.jpg", alt: "" },
      { id: "naklani-2",  src: "/images/gallery/pripravljalna-tekma-naklani-2026/PXL_20260228_151111120.jpg", alt: "" },
      { id: "naklani-3",  src: "/images/gallery/pripravljalna-tekma-naklani-2026/PXL_20260228_151119830.jpg", alt: "" },
      { id: "naklani-4",  src: "/images/gallery/pripravljalna-tekma-naklani-2026/PXL_20260228_151125311.jpg", alt: "" },
      { id: "naklani-5",  src: "/images/gallery/pripravljalna-tekma-naklani-2026/PXL_20260228_151153672.jpg", alt: "" },
      { id: "naklani-6",  src: "/images/gallery/pripravljalna-tekma-naklani-2026/PXL_20260228_151155111.jpg", alt: "" },
      { id: "naklani-7",  src: "/images/gallery/pripravljalna-tekma-naklani-2026/PXL_20260228_152237761.jpg", alt: "" },
      { id: "naklani-8",  src: "/images/gallery/pripravljalna-tekma-naklani-2026/PXL_20260228_152240691.jpg", alt: "" },
      { id: "naklani-9",  src: "/images/gallery/pripravljalna-tekma-naklani-2026/PXL_20260228_153420276.jpg", alt: "" },
      { id: "naklani-10", src: "/images/gallery/pripravljalna-tekma-naklani-2026/PXL_20260228_153422025.jpg", alt: "" },
      { id: "naklani-11", src: "/images/gallery/pripravljalna-tekma-naklani-2026/PXL_20260228_153430772.jpg", alt: "" },
      { id: "naklani-12", src: "/images/gallery/pripravljalna-tekma-naklani-2026/PXL_20260228_153431701.jpg", alt: "" },
      { id: "naklani-13", src: "/images/gallery/pripravljalna-tekma-naklani-2026/PXL_20260228_153447810.jpg", alt: "" },
      { id: "naklani-14", src: "/images/gallery/pripravljalna-tekma-naklani-2026/PXL_20260228_153533098.jpg", alt: "" },
      { id: "naklani-15", src: "/images/gallery/pripravljalna-tekma-naklani-2026/PXL_20260228_153541973.jpg", alt: "" },
      { id: "naklani-16", src: "/images/gallery/pripravljalna-tekma-naklani-2026/IMG-2ccc1aecaa662b3b9cbffaf9dfeb4fe1-V.jpg", alt: "" },
      { id: "naklani-17", src: "/images/gallery/pripravljalna-tekma-naklani-2026/IMG-3de65e6e3714cbee583f0f3e0a4ded46-V.jpg", alt: "" },
      { id: "naklani-18", src: "/images/gallery/pripravljalna-tekma-naklani-2026/IMG-43f1c0e2f0accbd64b7de9ac9205a95c-V.jpg", alt: "" },
      { id: "naklani-19", src: "/images/gallery/pripravljalna-tekma-naklani-2026/IMG-9779e5aa96af140499797a933ab5854a-V.jpg", alt: "" },
      { id: "naklani-20", src: "/images/gallery/pripravljalna-tekma-naklani-2026/IMG-a8e7150f970a70b6669835660d114d9f-V.jpg", alt: "" },
      { id: "naklani-21", src: "/images/gallery/pripravljalna-tekma-naklani-2026/IMG-ba0f454096f090456dd62250a5b8af50-V.jpg", alt: "" },
      { id: "naklani-22", src: "/images/gallery/pripravljalna-tekma-naklani-2026/IMG-d7c56b958ebf44c0bb8b8b083b990314-V.jpg", alt: "" },
      { id: "naklani-23", src: "/images/gallery/pripravljalna-tekma-naklani-2026/IMG-df02fd86e8b3f43a700f142098e2eeca-V.jpg", alt: "" },
      { id: "naklani-24", src: "/images/gallery/pripravljalna-tekma-naklani-2026/IMG-ec496c51e44fd5e73a17ce80bc6c5fa6-V.jpg", alt: "" },
      { id: "naklani-25", src: "/images/gallery/pripravljalna-tekma-naklani-2026/lisjaki_formation2.png", alt: "" },
      { id: "naklani-26", src: "/images/gallery/pripravljalna-tekma-naklani-2026/naklani_formation.png", alt: "" },
      { id: "naklani-27", src: "/images/gallery/pripravljalna-tekma-naklani-2026/PXL_20260228_151025502.mp4", alt: "", type: "video" },
      { id: "naklani-28", src: "/images/gallery/pripravljalna-tekma-naklani-2026/PXL_20260228_153518674.mp4", alt: "", type: "video" },
    ],
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
