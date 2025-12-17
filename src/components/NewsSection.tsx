import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar } from "lucide-react";

const newsData = [
  {
    id: 1,
    title: "Težka tekma proti ekipi Smola",
    excerpt:
      "Kljub srčni igri smo na gostovanju pri vodilni ekipi lige doživeli poraz. Fantje so se borili do zadnje minute.",
    date: "15. dec 2024",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=250&fit=crop",
  },
  {
    id: 2,
    title: "Izlet na tekmo Slovenije v Stožicah",
    excerpt:
      "Skupaj smo navijali za reprezentanco na tekmi kvalifikacij. Nepozabna izkušnja za celotno ekipo!",
    date: "10. dec 2024",
    image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=400&h=250&fit=crop",
  },
  {
    id: 3,
    title: "Novi dresi za sezono 2025/26",
    excerpt:
      "S ponosom predstavljamo novo oranžno opremo. Dresi bodo na voljo za naročilo tudi za navijače.",
    date: "5. dec 2024",
    image: "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=400&h=250&fit=crop",
  },
];

const NewsSection = () => {
  return (
    <section id="news" className="py-16 md:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
          Novice
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {newsData.map((news, index) => (
            <Card
              key={news.id}
              className="overflow-hidden shadow-card hover:shadow-elevated transition-shadow duration-300 border-0 animate-fade-in group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
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
                <Button variant="link" className="p-0 h-auto text-primary font-semibold group/btn">
                  Preberi več
                  <ArrowRight
                    size={16}
                    className="ml-1 group-hover/btn:translate-x-1 transition-transform"
                  />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
