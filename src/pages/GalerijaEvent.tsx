import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getGalleryEventBySlug } from "@/data/gallery";

const GalerijaEvent = () => {
  const { slug } = useParams<{ slug: string }>();
  const event = slug ? getGalleryEventBySlug(slug) : undefined;

  if (!event) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-16 md:pt-20">
          <div className="container mx-auto px-4 py-16 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Album ni najden
            </h1>
            <p className="text-muted-foreground mb-8">
              Žal nismo našli albuma, ki ga iščete.
            </p>
            <Button asChild>
              <Link to="/galerija">Nazaj na galerijo</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 md:pt-20">
        {/* Header */}
        <section className="bg-charcoal text-primary-foreground py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Link
              to="/galerija"
              className="inline-flex items-center gap-2 text-primary-foreground/70 hover:text-primary-foreground transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Nazaj na galerijo
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.title}</h1>
            <div className="flex items-center gap-2 text-primary-foreground/70">
              <Calendar className="w-5 h-5" />
              <span>
                {new Date(event.date).toLocaleDateString("sl-SI", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              <span className="mx-2">•</span>
              <span>{event.images.length} fotografij</span>
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {event.images.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-xl shadow-card"
                >
                  <img
                    src={image.src}
                    alt={image.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default GalerijaEvent;
