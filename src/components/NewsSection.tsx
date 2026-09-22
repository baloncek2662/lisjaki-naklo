import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Calendar } from "lucide-react";
import { newsData } from "@/data/news";

const NewsSection = () => {
  // Show only the first 3 news items on the homepage
  const displayedNews = newsData.slice(0, 3);

  return (
    <section id="news" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
          Novice
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {displayedNews.map((news, index) => (
            <Link key={news.id} to={`/novice/${news.slug}`}>
              <Card
                className="overflow-hidden shadow-card hover:shadow-elevated transition-shadow duration-300 border-0 animate-fade-in group h-full"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative overflow-hidden">
                  <img
                    src={news.image}
                    alt={news.title}
                    className={news.imageFit === "contain"
                      ? "w-full h-48 object-contain bg-muted"
                      : "w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"}
                  />
                  <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5">
                    <Calendar size={12} />
                    {news.date}
                  </div>
                </div>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-foreground mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                    {news.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                    {news.excerpt}
                  </p>
                  <span className="inline-flex items-center text-primary font-semibold group/btn">
                    Preberi več
                    <ArrowRight
                      size={16}
                      className="ml-1 group-hover/btn:translate-x-1 transition-transform"
                    />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* View all news link */}
        <div className="text-center mt-8">
          <Link 
            to="/novice" 
            className="inline-flex items-center text-primary font-semibold hover:text-primary/80 transition-colors"
          >
            Vse novice
            <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
