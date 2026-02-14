import { useEffect, useState } from "react";
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry";
import { X } from "lucide-react";

// Interface adaptÃ©e Ã  Prisma
interface MediaPhoto {
  id: string;
  url: string;
  title: string | null;
}

const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export function Medias() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [photos, setPhotos] = useState<MediaPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadPhotos = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBase}/api/media/photos`);
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        const data = await response.json();

        if (isMounted) {
          setPhotos(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Erreur inconnue");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadPhotos();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen pt-20">
      {/* Header Section */}
      <section className="py-20 bg-gradient-to-b from-[var(--deep-charcoal)] to-[var(--charcoal-light)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl mb-6 font-serif">MÃ©dias</h1>
          <p className="text-xl text-[var(--off-white)] max-w-3xl mx-auto leading-relaxed font-sans opacity-90">
            Plongez dans l'univers visuel et artistique de la Compagnie
            Culturelle JDR.
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 bg-[var(--off-white)] min-h-[500px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="text-center py-20 text-[var(--charcoal-lighter)] font-sans">
              Ouverture des archives...
            </div>
          )}

          {!isLoading && error && (
            <div className="text-center py-20 text-red-600 font-sans">
              Erreur : {error}
            </div>
          )}

          {!isLoading && !error && photos.length === 0 && (
            <div className="text-center py-20 text-[var(--charcoal-lighter)] font-sans">
              La galerie est vide pour le moment.
            </div>
          )}

          {!isLoading && !error && photos.length > 0 && (
            <ResponsiveMasonry
              columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
            >
              <Masonry gutter="1.5rem">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative group cursor-pointer overflow-hidden rounded-xl shadow-sm hover:shadow-2xl transition-all duration-500 bg-white"
                    onClick={() => setSelectedImage(photo.url)}
                  >
                    <img
                      src={photo.url}
                      alt={photo.title ?? "Photo de la compagnie"}
                      className="w-full h-auto block transform group-hover:scale-105 transition-transform duration-700 ease-out"
                      loading="lazy"
                    />

                    {/* Overlay au survol */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                      <p className="text-white text-lg font-sans font-medium">
                        {photo.title ?? "Voir en grand"}
                      </p>
                    </div>
                  </div>
                ))}
              </Masonry>
            </ResponsiveMasonry>
          )}
        </div>
      </section>

      {/* Lightbox (Plein Ã©cran) */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 text-white/70 hover:text-[var(--yellow-primary)] transition-colors p-2"
            onClick={() => setSelectedImage(null)}
            aria-label="Fermer"
          >
            <X className="w-10 h-10" />
          </button>

          <img
            src={selectedImage}
            alt="Plein Ã©cran"
            className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

