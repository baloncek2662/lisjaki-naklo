import { Link } from "react-router-dom";
import { Folder, Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { featuredImages, galleryEvents } from "@/data/gallery";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

const Galerija = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const handleNext = useCallback(() => {
    setSelectedImageIndex((prev) =>
      prev === null ? null : (prev + 1) % featuredImages.length
    );
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedImageIndex((prev) =>
      prev === null ? null : (prev - 1 + featuredImages.length) % featuredImages.length
    );
  }, []);

  const handleClose = useCallback(() => {
    setSelectedImageIndex(null);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null) return;

      switch (e.key) {
        case "ArrowRight":
          handleNext();
          break;
        case "ArrowLeft":
          handlePrev();
          break;
        case "Escape":
          handleClose();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, handleNext, handlePrev, handleClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedImageIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedImageIndex]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 md:pt-20">
        {/* Hero Section */}
        <section className="bg-charcoal text-primary-foreground py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Galerija</h1>
            <p>
              Pregled fotografij naših tekem, športnih dogodkov in druženj.
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
              {featuredImages.map((image, index) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-xl shadow-card cursor-pointer"
                  onClick={() => setSelectedImageIndex(index)}
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

                    {/* Cover Image */}
                    <div className="absolute inset-0">
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
                          {event.dateLabel ?? new Date(event.date).toLocaleDateString("sl-SI", {
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

      {/* Lightbox Modal */}
      <div
        className={cn(
          "fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm transition-all duration-300 flex items-center justify-center opacity-0 pointer-events-none",
          selectedImageIndex !== null && "opacity-100 pointer-events-auto"
        )}
        onClick={handleClose}
      >
        {selectedImageIndex !== null && (
          <>
            {/* Controls */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full z-[101]"
            >
              <X className="w-6 h-6" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full z-[101] hidden md:block"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white transition-colors bg-white/10 hover:bg-white/20 rounded-full z-[101] hidden md:block"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            {/* Main Image */}
            <div
              className="relative w-full h-full p-4 md:p-12 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={featuredImages[selectedImageIndex].src}
                alt={featuredImages[selectedImageIndex].alt}
                className="max-w-full max-h-full object-contain shadow-2xl rounded-sm animate-in fade-in zoom-in-95 duration-300"
              />

              {/* Caption if available */}
              {featuredImages[selectedImageIndex].caption && (
                <div className="absolute bottom-8 left-0 right-0 text-center px-4">
                  <p className="text-white/90 text-lg font-medium bg-black/50 inline-block px-4 py-2 rounded-lg backdrop-blur-md">
                    {featuredImages[selectedImageIndex].caption}
                  </p>
                </div>
              )}
            </div>

            {/* Mobile Navigation Hints */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden">
              <div className="flex gap-2 text-white/50 text-sm">
                <span>← Povleci ali klikni robove →</span>
              </div>
            </div>

            {/* Click zones for mobile easy nav */}
            <div className="absolute inset-y-0 left-0 w-1/4 z-[100] md:hidden" onClick={(e) => { e.stopPropagation(); handlePrev(); }} />
            <div className="absolute inset-y-0 right-0 w-1/4 z-[100] md:hidden" onClick={(e) => { e.stopPropagation(); handleNext(); }} />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Galerija;
