import { useEffect, useState } from "react";
import { Calendar, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

// 1. Interface alignée sur Prisma avec sécurité sur les tableaux
interface NewsItem {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  images: {
    url: string;
    alt: string | null;
  }[];
}

// const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:4000";
const apiBase = "http://localhost:4000";
const MAX_EXCERPT_LENGTH = 160;

// Utilitaire pour un formatage de date propre
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export function Actualites() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadNews = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBase}/api/news`);
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setNews(data);
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

    loadNews();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen pt-20">
      {/* --- En-tête --- */}
      <section className="py-20 bg-gradient-to-b from-[var(--deep-charcoal)] to-[var(--charcoal-light)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl mb-6 font-serif">Actualités</h1>
          <p className="text-xl text-[var(--off-white)] max-w-3xl mx-auto leading-relaxed font-sans">
            Suivez les dernières nouvelles de la Compagnie JDR, nos créations et
            nos événements à venir.
          </p>
        </div>
      </section>

      {/* --- Liste des actualités --- */}
      <section className="py-16 bg-[var(--off-white)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="text-center text-[var(--charcoal-lighter)] font-sans">
              Chargement des actualités...
            </div>
          )}

          {!isLoading && error && (
            <div className="text-center text-red-600 font-sans">
              Erreur: {error}
            </div>
          )}

          {!isLoading && !error && news.length === 0 && (
            <div className="text-center text-[var(--charcoal-lighter)] font-sans">
              Aucune actualité pour le moment.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((item) => {
              // SÉCURITÉ : On vérifie si images existe et n'est pas vide
              const hasImage = item.images && item.images.length > 0;
              const mainImage = hasImage ? item.images[0] : null;

              return (
                <article
                  key={item.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
                >
                  <div className="relative h-64 overflow-hidden">
                    {mainImage ? (
                      <img
                        src={mainImage.url}
                        alt={mainImage.alt || item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--charcoal-light)] flex items-center justify-center font-sans text-[var(--off-white)]">
                        Image indisponible
                      </div>
                    )}

                    {/* Badge Date */}
                    <div className="absolute top-4 left-4 flex items-center space-x-2 px-3 py-1.5 rounded-md bg-[var(--yellow-primary)]">
                      <Calendar className="w-4 h-4 text-[var(--deep-charcoal)]" />
                      <span className="text-sm font-bold text-[var(--deep-charcoal)] font-sans">
                        {formatDate(item.publishedAt)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-2xl mb-3 font-serif text-[var(--deep-charcoal)]">
                      {item.title}
                    </h3>
                    <p className="text-[var(--charcoal-lighter)] mb-4 leading-relaxed font-sans flex-grow">
                      {item.content.length > MAX_EXCERPT_LENGTH
                        ? `${item.content.slice(0, MAX_EXCERPT_LENGTH).trim()}...`
                        : item.content}
                    </p>
                    <Link
                      to={`/actualites/${item.id}`}
                      className="inline-flex items-center font-bold text-[var(--blue-primary)] hover:text-[var(--blue-dark)] transition-colors group"
                    >
                      Lire plus
                      <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
