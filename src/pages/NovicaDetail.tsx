import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getNewsArticleBySlug } from "@/data/news";

// Simple markdown renderer
const renderMarkdown = (content: string): string => {
  let html = content
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-xl font-bold text-foreground mt-6 mb-3">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold text-foreground mt-8 mb-4">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-3xl md:text-4xl font-bold text-foreground mb-6">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground bg-muted/30 rounded-r">$1</blockquote>')
    // Unordered lists
    .replace(/^\- (.*$)/gim, '<li class="ml-4 list-disc text-muted-foreground">$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal text-muted-foreground">$1</li>')
    // Tables
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(cell => cell.trim() !== '');
      if (cells.every(cell => cell.trim().match(/^[-]+$/))) {
        return ''; // Skip separator row
      }
      const isHeader = match.includes('---');
      const cellTag = isHeader ? 'th' : 'td';
      const cellClass = isHeader
        ? 'border border-border px-4 py-2 bg-muted font-semibold text-foreground'
        : 'border border-border px-4 py-2 text-muted-foreground';
      return `<tr>${cells.map(cell => `<${cellTag} class="${cellClass}">${cell.trim()}</${cellTag}>`).join('')}</tr>`;
    })
    // Emojis (keep as is)
    // Paragraphs - wrap loose text
    .replace(/^(?!<[h|l|b|t])(.*$)/gim, (match) => {
      if (match.trim() === '' || match.startsWith('<')) return match;
      return `<p class="text-muted-foreground mb-4 leading-relaxed">${match}</p>`;
    });

  // Wrap lists
  html = html.replace(/(<li.*<\/li>\n?)+/g, (match) => {
    if (match.includes('list-decimal')) {
      return `<ol class="my-4 space-y-2">${match}</ol>`;
    }
    return `<ul class="my-4 space-y-2">${match}</ul>`;
  });

  // Wrap tables
  html = html.replace(/(<tr>.*<\/tr>\n?)+/g, (match) => {
    return `<table class="w-full my-6 border-collapse">${match}</table>`;
  });

  return html;
};

const NovicaDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = slug ? getNewsArticleBySlug(slug) : undefined;

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-20 md:pt-24">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Novica ni najdena</h1>
            <Link to="/novice">
              <Button variant="outline">
                <ArrowLeft size={16} className="mr-2" />
                Nazaj na novice
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Image */}
        <div className="relative h-64 md:h-96 overflow-hidden mt-16 md:mt-20">
          <img
            src={article.image}
            alt={article.title}
            className={article.imageFit === "contain"
              ? "w-full h-full object-contain bg-muted"
              : "w-full h-full object-cover object-[center_42%]"}
          />
          {article.imageFit !== "contain" && (
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          )}
        </div>

        {/* Content */}
        <article className={`container mx-auto px-4 relative z-10 ${article.imageFit === "contain" ? "mt-8" : "-mt-24"}`}>
          <div className="max-w-3xl mx-auto">
            {/* Back link */}
            <Link to="/novice" className="inline-flex items-center text-primary hover:text-primary/80 mb-6 transition-colors">
              <ArrowLeft size={16} className="mr-2" />
              Nazaj na novice
            </Link>

            {/* Date */}
            <div className="flex items-center gap-2 text-muted-foreground mb-4">
              <Calendar size={16} />
              {article.date}
            </div>

            {/* Article content */}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(article.content) }}
            />
            {article.gallerySlug && (
              <Button asChild className="mt-8">
                <Link to={`/galerija/${article.gallerySlug}`}>Oglej si album</Link>
              </Button>
            )}
          </div>
        </article>

        {/* Bottom spacing */}
        <div className="py-16" />
      </main>

      <Footer />
    </div>
  );
};

export default NovicaDetail;
