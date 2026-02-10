import { useEffect, useState } from 'react';
import Masonry from 'react-responsive-masonry';
import { X } from 'lucide-react';

interface MediaPhoto {
  id: number;
  url: string;
  title: string | null;
}

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

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
        if (!Array.isArray(data)) {
          throw new Error('Reponse invalide du serveur.');
        }
        if (isMounted) {
          setPhotos(data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erreur inconnue');
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
      <section className="py-20 bg-gradient-to-b from-[var(--deep-charcoal)] to-[var(--charcoal-light)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1
              className="text-5xl md:text-6xl mb-6"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Medias
            </h1>
            <p
              className="text-xl text-[var(--off-white)] max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Plongez dans l'univers visuel de la Compagnie Culturelle JDR.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--off-white)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="text-center text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Chargement des medias...
            </div>
          )}
          {!isLoading && error && (
            <div className="text-center text-red-600" style={{ fontFamily: 'var(--font-sans)' }}>
              Erreur: {error}
            </div>
          )}
          {!isLoading && !error && photos.length === 0 && (
            <div className="text-center text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Aucune photo pour le moment.
            </div>
          )}
          {!isLoading && !error && photos.length > 0 && (
            <Masonry columnsCount={3} gutter="1.5rem">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300"
                  onClick={() => setSelectedImage(photo.url)}
                >
                  <img
                    src={photo.url}
                    alt={photo.title ?? 'Photo'}
                    className="w-full h-auto group-hover:scale-110 transition-transform duration-500"
                    style={{ display: 'block' }}
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p
                        className="text-white text-lg"
                        style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}
                      >
                        {photo.title ?? 'Photo'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </Masonry>
          )}
        </div>
      </section>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white hover:text-[var(--gold)] transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
