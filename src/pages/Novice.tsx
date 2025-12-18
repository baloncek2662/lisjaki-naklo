import { Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const allNews = [
  {
    id: 1,
    title: "Težka tekma proti ekipi Smola",
    excerpt: "Kljub borbenemu nastopu smo morali priznati premoč vodilni ekipi lige. Fantje so pokazali srce in karakter.",
    date: "15. Dec 2024",
    image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop",
    content: "Celotna ekipa je pokazala izjemno borbenost na zadnji tekmi proti vodilni ekipi lige Smola. Kljub končnemu porazu 2:1 smo lahko ponosni na predstavo naših fantov."
  },
  {
    id: 2,
    title: "Izlet na tekmo Slovenije v Stožicah",
    excerpt: "Nepozabno doživetje za vse člane kluba. Skupaj smo navijali za našo reprezentanco.",
    date: "10. Dec 2024",
    image: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=600&h=400&fit=crop",
    content: "Organizirali smo izlet na tekmo slovenske nogometne reprezentance v Stožicah. Več kot 20 članov kluba se je udeležilo dogodka."
  },
  {
    id: 3,
    title: "Novo sponzorstvo za sezono 2025/26",
    excerpt: "Z veseljem naznanjamo novo partnerstvo, ki bo pomagalo pri razvoju našega kluba.",
    date: "5. Dec 2024",
    image: "https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=600&h=400&fit=crop",
    content: "Podpisali smo novo sponzorsko pogodbo, ki nam bo omogočila nakup nove opreme in izboljšanje infrastrukture."
  },
  {
    id: 4,
    title: "Uspešna novoletna zabava",
    excerpt: "Člani kluba smo se zbrali na tradicionalni novoletni zabavi in proslavili uspešno leto.",
    date: "28. Nov 2024",
    image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600&h=400&fit=crop",
    content: "Novoletna zabava je bila odličen uspeh. Zahvaljujemo se vsem članom in podpornikom za udeležbo."
  },
  {
    id: 5,
    title: "Zmaga proti ŠD Podnart",
    excerpt: "Fantastična predstava naše ekipe v lokalnem derbiju. Končni rezultat 3:1 za Lisjake!",
    date: "20. Nov 2024",
    image: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=600&h=400&fit=crop",
    content: "V napeti tekmi proti sosednjem ŠD Podnart smo pokazali odlično igro in zasluženo zmagali s 3:1."
  },
  {
    id: 6,
    title: "Začetek zimskih priprav",
    excerpt: "Ekipa je začela z zimskimi pripravami. Intenzivni treningi do začetka spomladanskega dela sezone.",
    date: "15. Nov 2024",
    image: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=600&h=400&fit=crop",
    content: "Pod vodstvom trenerja smo začeli z zimskimi pripravami. Fokus je na kondiciji in taktiki."
  },
];

const Novice = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 md:pt-24">
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
              {allNews.map((news) => (
                <Card
                  key={news.id}
                  className="group overflow-hidden border-border hover:shadow-elevated transition-all duration-300"
                >
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
                    <Button
                      variant="ghost"
                      className="p-0 h-auto text-primary hover:text-primary/80 group/btn"
                    >
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
      </main>

      <Footer />
    </div>
  );
};

export default Novice;