// Import markdown files as raw text
import article1 from "./articles/tezka-tekma-proti-ekipi-smola.md?raw";

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
