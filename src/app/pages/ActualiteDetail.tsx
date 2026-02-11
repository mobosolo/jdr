import { useEffect, useState } from 'react';
import { Calendar, ChevronLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  content: string | null;
  image: string | null;
}

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function ActualiteDetail() {
  const { id } = useParams();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadNews = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBase}/api/news/${id}`);
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        const data = await response.json();
        if (!data || typeof data !== 'object') {
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
  }, [id]);

  return (
    <div className="min-h-screen pt-20 bg-[var(--off-white)]">
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/actualites"
            className="inline-flex items-center transition-colors"
            style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--blue-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--blue-dark)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--blue-primary)'}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Retour aux actualites
          </Link>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="text-center text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Chargement de l'actualite...
            </div>
          )}
          {!isLoading && error && (
            <div className="text-center text-red-600" style={{ fontFamily: 'var(--font-sans)' }}>
              Erreur: {error}
            </div>
          )}
          {!isLoading && !error && !news && (
            <div className="text-center text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Actualite introuvable.
            </div>
          )}
          {!isLoading && !error && news && (
            <article className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative h-80 overflow-hidden">
                {news.image ? (
                  <img
                    src={news.image}
                    alt={news.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[var(--charcoal-light)] flex items-center justify-center">
                    <span className="text-sm text-[var(--off-white)]" style={{ fontFamily: 'var(--font-sans)' }}>
                      Image indisponible
                    </span>
                  </div>
                )}
                <div className="absolute top-4 left-4 flex items-center space-x-2 px-3 py-1.5 rounded-md" style={{ backgroundColor: 'var(--yellow-primary)' }}>
                  <Calendar className="w-4 h-4" style={{ color: 'var(--deep-charcoal)' }} />
                  <span
                    className="text-sm"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      color: 'var(--deep-charcoal)',
                      fontWeight: 600,
                    }}
                  >
                    {news.date}
                  </span>
                </div>
              </div>
              <div className="p-8">
                <h1
                  className="text-3xl md:text-4xl mb-4"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--deep-charcoal)' }}
                >
                  {news.title}
                </h1>
                <p
                  className="text-[var(--charcoal-lighter)] mb-6 leading-relaxed"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {news.excerpt}
                </p>
                {news.content && (
                  <p
                    className="text-[var(--charcoal-lighter)] leading-relaxed"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {news.content}
                  </p>
                )}
              </div>
            </article>
          )}
        </div>
      </section>
    </div>
  );
}
