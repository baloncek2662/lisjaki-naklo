// Import markdown files as raw text
import article1 from "./articles/tezka-tekma-proti-ekipi-smola.md?raw";
import article2 from "./articles/izlet-na-tekmo-slovenije-v-stozicah.md?raw";
import article3 from "./articles/novo-sponzorstvo-za-sezono-2025-26.md?raw";
import article4 from "./articles/uspesna-novoletna-zabava.md?raw";
import article5 from "./articles/zmaga-proti-sd-podnart.md?raw";
import article6 from "./articles/zacetek-zimskih-priprav.md?raw";

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
    slug: "tezka-tekma-proti-ekipi-smola",
    title: "Težka tekma proti ekipi Smola",
    excerpt: "Kljub borbenemu nastopu smo morali priznati premoč vodilni ekipi lige. Fantje so pokazali srce in karakter.",
    date: "15. Dec 2024",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop",
    content: article1,
  },
  {
    id: 2,
    slug: "izlet-na-tekmo-slovenije-v-stozicah",
    title: "Izlet na tekmo Slovenije v Stožicah",
    excerpt: "Nepozabno doživetje za vse člane kluba. Skupaj smo navijali za našo reprezentanco.",
    date: "10. Dec 2024",
    image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600&h=400&fit=crop",
    content: article2,
  },
  {
    id: 3,
    slug: "novo-sponzorstvo-za-sezono-2025-26",
    title: "Novo sponzorstvo za sezono 2025/26",
    excerpt: "Z veseljem naznanjamo novo partnerstvo, ki bo pomagalo pri razvoju našega kluba.",
    date: "5. Dec 2024",
    image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&h=400&fit=crop",
    content: article3,
  },
  {
    id: 4,
    slug: "uspesna-novoletna-zabava",
    title: "Uspešna novoletna zabava",
    excerpt: "Člani kluba smo se zbrali na tradicionalni novoletni zabavi in proslavili uspešno leto.",
    date: "28. Nov 2024",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop",
    content: article4,
  },
  {
    id: 5,
    slug: "zmaga-proti-sd-podnart",
    title: "Zmaga proti ŠD Podnart",
    excerpt: "Fantastična predstava naše ekipe v lokalnem derbiju. Končni rezultat 3:1 za Lisjake!",
    date: "20. Nov 2024",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&h=400&fit=crop",
    content: article5,
  },
  {
    id: 6,
    slug: "zacetek-zimskih-priprav",
    title: "Začetek zimskih priprav",
    excerpt: "Ekipa je začela z zimskimi pripravami. Intenzivni treningi do začetka spomladanskega dela sezone.",
    date: "15. Nov 2024",
    image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=600&h=400&fit=crop",
    content: article6,
  },
];

export const getNewsArticleBySlug = (slug: string): NewsArticle | undefined => {
  return newsData.find((article) => article.slug === slug);
};
