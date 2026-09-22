// Import markdown files as raw text
import article1 from "./articles/tezka-tekma-proti-ekipi-smola.md?raw";
import article2 from "./articles/pripravljalna-tekma-naklani.md?raw";
import article3 from "./articles/prva-zmaga-liga-a-baffi-brezje.md?raw";
import article4 from "./articles/prvi-lisjakov-turnir-v-odbojki.md?raw";
import article5 from "./articles/zmaga-proti-nk-hom.md?raw";
import article6 from "./articles/priprave-2026.md?raw";

export interface NewsArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  content: string;
  imageFit?: "contain";
  gallerySlug?: string;
}

export const newsData: NewsArticle[] = [
  {
    id: 5,
    slug: "zmaga-proti-nk-hom",
    title: "Lisjaki premagali NK Hom s 5:2",
    excerpt: "David Naglič je zadel dvakrat, Jan Jesenko, Erik Petrovič in Blaž Logonder pa po enkrat. Jan se je razveselil svojega prvega zadetka v dresu Lisjakov.",
    date: "20. sep. 2026",
    image: "/images/news/lisjaki-nk-hom-september-2026.webp",
    imageFit: "contain",
    content: article5,
  },
  {
    id: 4,
    slug: "prvi-lisjakov-turnir-v-odbojki",
    title: "Prvi Lisjakov turnir v odbojki: hvala za odlično vzdušje!",
    excerpt: "V Športnem parku Naklo smo 13. septembra pripravili prvi Lisjakov turnir v odbojki na mivki. Čestitke najboljšim trem ekipam in hvala vsem udeležencem ter obiskovalcem!",
    date: "18. sep. 2026",
    image: "/images/gallery/turnir-odbojka-2026/P1092623.jpg",
    gallerySlug: "turnir-odbojka-2026",
    content: article4,
  },
  {
    id: 3,
    slug: "prva-zmaga-liga-a-baffi-brezje",
    title: "Prva zmaga v ligi A! Lisjaki premagali Baffi Brezje 4:2",
    excerpt: "Zgodovinski trenutek za Lisjake! Prvo zmago v najtežji ligi smo vknjižili proti Baffi Brezje z rezultatom 4:2. Posebni čestitki greta Urbanu Martiču za prvi gol in Tomažu Hriberniku za prvi strelski gol z glavo.",
    date: "31. maj 2026",
    image: "/images/gallery/lisjaki-baffi-maj-2026.jpeg",
    content: article3,
  },
  {
    id: 6,
    slug: "priprave-2026",
    title: "Priprave 2026: Lisjaki v Poreču",
    excerpt: "Od 10. do 12. aprila 2026 smo bili Lisjaki na pripravah v Poreču. Trije dnevi, namenjeni pripravam na nadaljevanje sezone.",
    date: "10.–12. apr. 2026",
    image: "/images/gallery/priprave-2026/666239886_1271833417826925_4595179522553431878_n.jpg",
    gallerySlug: "priprave-2026",
    content: article6,
  },
  {
    id: 2,
    slug: "pripravljalna-tekma-naklani",
    gallerySlug: "pripravljalna-tekma-naklani-2026",
    title: "Pripravljalna tekma z Na'Klani: zmaga 3:2",
    excerpt: "V pripravljalni tekmi smo se pomerili z domačimi tekmeci Na'Klani in zmagali z rezultatom 3:2. Gaber Petrovič, Gašper Martič in Jaka Jerala so zadeli za Lisjake.",
    date: "28. feb. 2026",
    image: "/images/gallery/pripravljalna-tekma-naklani-2026/IMG-3de65e6e3714cbee583f0f3e0a4ded46-V.jpg",
    content: article2,
  },
  {
    id: 1,
    slug: "tezka-tekma-proti-ekipi-baffi-brezje",
    title: "Težka tekma proti ekipi Baffi Brezje",
    excerpt: "Kljub borbenemu nastopu smo morali priznati premoč ekipi Baffi Brezje. Na težkem terenu so fantje prikazali res kvalitetno in borbeno igro.",
    date: "26. okt. 2025",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop",
    content: article1,
  },
];

export const getNewsArticleBySlug = (slug: string): NewsArticle | undefined => {
  return newsData.find((article) => article.slug === slug);
};
