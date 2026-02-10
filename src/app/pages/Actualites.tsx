import { useEffect, useState } from 'react';
import { Calendar, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  content: string | null;
  image: string | null;
}

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const MAX_EXCERPT_LENGTH = 160;

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
        if (!Array.isArray(data)) {
          throw new Error('Reponse invalide du serveur.');
        }
        if (isMounted) {
          setNews(data);
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

    loadNews();

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
              Actualites
            </h1>
            <p
              className="text-xl text-[var(--off-white)] max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Retrouvez toutes les actualites et annonces de la Compagnie Culturelle JDR.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--off-white)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="text-center text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Chargement des actualites...
            </div>
          )}
          {!isLoading && error && (
            <div className="text-center text-red-600" style={{ fontFamily: 'var(--font-sans)' }}>
              Erreur: {error}
            </div>
          )}
          {!isLoading && !error && news.length === 0 && (
            <div className="text-center text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Aucune actualite pour le moment.
            </div>
          )}
          {!isLoading && !error && news.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300"
                >
                  <div className="relative h-64 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--charcoal-light)] flex items-center justify-center">
                        <span className="text-sm text-[var(--off-white)]" style={{ fontFamily: 'var(--font-sans)' }}>
                          Image indisponible
                        </span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 flex items-center space-x-2 bg-[var(--gold)] px-3 py-1.5 rounded-md">
                      <Calendar className="w-4 h-4" style={{ color: 'var(--deep-charcoal)' }} />
                      <span
                        className="text-sm"
                        style={{
                          fontFamily: 'var(--font-sans)',
                          color: 'var(--deep-charcoal)',
                          fontWeight: 500,
                        }}
                      >
                        {item.date}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3
                      className="text-2xl mb-3"
                      style={{
                        fontFamily: 'var(--font-serif)',
                        color: 'var(--deep-charcoal)',
                      }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-[var(--charcoal-lighter)] mb-4 leading-relaxed"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      {item.excerpt.length > MAX_EXCERPT_LENGTH
                        ? `${item.excerpt.slice(0, MAX_EXCERPT_LENGTH).trim()}...`
                        : item.excerpt}
                    </p>
                    <Link
                      to={`/actualites/${item.id}`}
                      className="inline-flex items-center text-[var(--gold)] hover:text-[var(--gold-dark)] transition-colors group/link"
                      style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}
                    >
                      Lire plus
                      <ChevronRight className="ml-1 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
