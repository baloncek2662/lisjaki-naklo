import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, X, ChevronLeft, ChevronRight, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { getGalleryEventBySlug } from "@/data/gallery";
import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

const GalerijaEvent = () => {
  const { slug } = useParams<{ slug: string }>();
  const event = slug ? getGalleryEventBySlug(slug) : undefined;
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const handleNext = useCallback(() => {
    if (!event) return;
    setSelectedImageIndex((prev) =>
      prev === null ? null : (prev + 1) % event.images.length
    );
  }, [event]);

  const handlePrev = useCallback(() => {
    if (!event) return;
    setSelectedImageIndex((prev) =>
      prev === null ? null : (prev - 1 + event.images.length) % event.images.length
    );
  }, [event]);

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
              <span>
                {event.images.filter(i => i.type !== "video").length} fotografij
                {event.images.some(i => i.type === "video") && `, ${event.images.filter(i => i.type === "video").length} videoposnetkov`}
              </span>
            </div>
          </div>
        </section>

        {/* Gallery Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {event.images.map((image, index) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-xl shadow-card cursor-pointer"
                  onClick={() => setSelectedImageIndex(index)}
                >
                  {image.type === "video" ? (
                    <>
                      <video
                        src={image.src}
                        className="w-full h-full object-cover"
                        preload="metadata"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                          <Play className="w-5 h-5 text-charcoal fill-charcoal ml-0.5" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                  )}
                </div>
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

            {/* Main Image / Video */}
            <div
              className="relative w-full h-full p-4 md:p-12 flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              {event.images[selectedImageIndex].type === "video" ? (
                <video
                  key={event.images[selectedImageIndex].src}
                  src={event.images[selectedImageIndex].src}
                  controls
                  autoPlay
                  className="max-w-full max-h-full shadow-2xl rounded-sm animate-in fade-in zoom-in-95 duration-300"
                />
              ) : (
                <img
                  src={event.images[selectedImageIndex].src}
                  alt={event.images[selectedImageIndex].alt}
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-sm animate-in fade-in zoom-in-95 duration-300"
                />
              )}

              {/* Caption if available */}
              {event.images[selectedImageIndex].caption && (
                <div className="absolute bottom-8 left-0 right-0 text-center px-4">
                  <p className="text-white/90 text-lg font-medium bg-black/50 inline-block px-4 py-2 rounded-lg backdrop-blur-md">
                    {event.images[selectedImageIndex].caption}
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

export default GalerijaEvent;
