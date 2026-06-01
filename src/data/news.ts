// Import markdown files as raw text
import article1 from "./articles/tezka-tekma-proti-ekipi-smola.md?raw";
import article2 from "./articles/pripravljalna-tekma-naklani.md?raw";
import article3 from "./articles/prva-zmaga-liga-a-baffi-brezje.md?raw";

export interface NewsArticle {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  image: string;
  content: string;
}

export const newsData: NewsArticle[] = [
  {
    id: 3,
    slug: "prva-zmaga-liga-a-baffi-brezje",
    title: "Prva zmaga v ligi A! Lisjaki premagali Baffi Brezje 4:2",
    excerpt: "Zgodovinski trenutek za Lisjake! Prvo zmago v najtežji ligi smo vknjižili proti Baffi Brezje z rezultatom 4:2. Posebni čestitki greta Urbanu Martiču za prvi gol in Tomažu Hriberniku za prvi strelski gol z glavo.",
    date: "31. maj 2026",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop",
    content: article3,
  },
  {
    id: 2,
    slug: "pripravljalna-tekma-naklani",
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
