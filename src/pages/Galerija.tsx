import { Link } from "react-router-dom";
import { Folder, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { featuredImages, galleryEvents } from "@/data/gallery";

const Galerija = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="bg-charcoal text-primary-foreground py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Galerija</h1>
            <p className="text-primary-foreground/70 max-w-2xl">
              Preglejte fotografije naših tekem, dogodkov in druženja. Uživajte v spominih!
            </p>
          </div>
        </section>

        {/* Featured Images */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">
              Izbrane fotografije
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {featuredImages.map((image) => (
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
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-sm font-medium">{image.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Event Galleries */}
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold mb-8 text-foreground">
              Albumi dogodkov
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {galleryEvents.map((event) => (
                <Link
                  key={event.id}
                  to={`/galerija/${event.slug}`}
                  className="group"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl shadow-card bg-card border border-border transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
                    {/* Folder-like top tab */}
                    <div className="absolute top-0 left-4 w-16 h-3 bg-primary rounded-t-lg z-10" />
                    
                    {/* Cover Image */}
                    <div className="absolute inset-0 mt-2">
                      <img
                        src={event.coverImage}
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-transparent" />
                    </div>
                    
                    {/* Folder Icon */}
                    <div className="absolute top-4 right-4 w-10 h-10 bg-primary/90 rounded-lg flex items-center justify-center">
                      <Folder className="w-5 h-5 text-primary-foreground" />
                    </div>
                    
                    {/* Event Info */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-primary-foreground">
                      <h3 className="font-semibold text-lg mb-1 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-primary-foreground/70">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(event.date).toLocaleDateString("sl-SI", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-primary-foreground/60 mt-1">
                        {event.images.length} fotografij
                      </p>
                    </div>
                  </div>
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

export default Galerija;
