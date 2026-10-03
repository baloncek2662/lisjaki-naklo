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

import records from './content/news.json';
const bodies = import.meta.glob('./articles/*.md', { query: '?raw', import: 'default', eager: true }) as Record<string,string>;
export const newsData: NewsArticle[] = [...records].sort((a,b) => b.publishedAt.localeCompare(a.publishedAt)||a.slug.localeCompare(b.slug)).map(article => ({ ...article, content: bodies['./articles/'+article.body] } as NewsArticle));
export const getNewsArticleBySlug = (slug: string): NewsArticle | undefined => newsData.find(article => article.slug === slug);
