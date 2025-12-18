import { Calendar, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { newsData } from "@/data/news";

const Novice = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-16 md:pt-20">
        {/* Header */}
        <section className="bg-secondary py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-secondary-foreground mb-4">
              Novice
            </h1>
            <p className="text-muted-foreground text-lg">
              Vse novice in obvestila kluba Lisjaki Naklo
            </p>
          </div>
        </section>

        {/* News Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newsData.map((news) => (
                <Link key={news.id} to={`/novice/${news.slug}`}>
                  <Card className="group overflow-hidden border-border hover:shadow-elevated transition-all duration-300 h-full">
                    <div className="relative overflow-hidden">
                      <img
                        src={news.image}
                        alt={news.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <Calendar size={14} />
                        {news.date}
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                        {news.title}
                      </h3>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {news.excerpt}
                      </p>
                      <span className="inline-flex items-center text-primary font-medium group/btn">
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
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Novice;
