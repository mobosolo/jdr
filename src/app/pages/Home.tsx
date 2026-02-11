import { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { ChevronRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  image: string | null;
}

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const MAX_EXCERPT_LENGTH = 120;

export function Home() {
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    cssEase: 'ease-in-out',
    pauseOnHover: false,
  };

  const heroSlides = [
    {
      image: 'https://images.unsplash.com/photo-1767294274254-57367fa62236?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwc3RhZ2UlMjBwZXJmb3JtYW5jZSUyMGRyYW1hdGljJTIwbGlnaHRpbmd8ZW58MXx8fHwxNzcwMzE3ODg4fDA&ixlib=rb-4.1.0&q=80&w=1080',
      title: "L'Art de la Scene",
      subtitle: 'Decouvrez nos spectacles exceptionnels',
    },
    {
      image: 'https://images.unsplash.com/photo-1760543320338-7bde1336eaef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxsZXQlMjBkYW5jZXJzJTIwc3RhZ2UlMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NzAzMTc4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Passion et Mouvement',
      subtitle: "Des performances qui touchent l'ame",
    },
    {
      image: 'https://images.unsplash.com/photo-1713033766707-2fac55b1a6c9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxvcGVyYSUyMHRoZWF0ZXIlMjBkcmFtYXRpYyUyMHBlcmZvcm1hbmNlfGVufDF8fHx8MTc3MDMxNzg4OXww&ixlib=rb-4.1.0&q=80&w=1080',
      title: 'Theatre Contemporain',
      subtitle: 'Une vision moderne des arts de la scene',
    },
  ];

  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(true);
  const [newsError, setNewsError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadNews = async () => {
      setIsLoadingNews(true);
      setNewsError(null);
      try {
        const response = await fetch(`${apiBase}/api/news?limit=3`);
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
          setNewsError(err instanceof Error ? err.message : 'Erreur inconnue');
        }
      } finally {
        if (isMounted) {
          setIsLoadingNews(false);
        }
      }
    };

    loadNews();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative h-screen">
        <Slider {...sliderSettings} className="h-full">
          {heroSlides.map((slide, index) => (
            <div key={index} className="relative h-screen">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              </div>
              <div className="relative h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                  <div className="max-w-2xl">
                    <h1
                      className="text-5xl md:text-6xl lg:text-7xl mb-6 text-white leading-tight"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {slide.title}
                    </h1>
                    <p
                      className="text-xl md:text-2xl mb-8 text-[var(--off-white)]"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      {slide.subtitle}
                    </p>
                    <Link
                      to="/spectacles"
                      className="inline-flex items-center px-8 py-4 rounded-md transition-all duration-300 hover:scale-105 group"
                      style={{
                        backgroundColor: 'var(--yellow-primary)',
                        color: 'var(--deep-charcoal)',
                        fontFamily: 'var(--font-sans)',
                        fontWeight: 500,
                      }}
                    >
                      Voir nos spectacles
                      <ChevronRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      <section className="py-20 bg-[var(--off-white)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-4xl md:text-5xl mb-4"
              style={{
                fontFamily: 'var(--font-serif)',
                color: 'var(--deep-charcoal)',
              }}
            >
              Actualites
            </h2>
            <div className="w-24 h-1 mx-auto" style={{ backgroundColor: 'var(--blue-primary)' }} />
          </div>

          {isLoadingNews && (
            <div className="text-center text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Chargement des actualites...
            </div>
          )}
          {!isLoadingNews && newsError && (
            <div className="text-center text-red-600" style={{ fontFamily: 'var(--font-sans)' }}>
              Erreur: {newsError}
            </div>
          )}
          {!isLoadingNews && !newsError && news.length === 0 && (
            <div className="text-center text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Aucune actualite pour le moment.
            </div>
          )}
          {!isLoadingNews && !newsError && news.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {news.map((item) => (
                <article
                  key={item.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group"
                >
                  <div className="relative h-64 overflow-hidden">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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
                        {item.date}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3
                      className="text-2xl mb-3 transition-colors"
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
                    <button
                      className="inline-flex items-center transition-colors group/link"
                      style={{ fontFamily: 'var(--font-sans)', fontWeight: 600, color: 'var(--blue-primary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--blue-dark)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--blue-primary)'}
                    >
                      Lire la suite
                      <ChevronRight className="ml-1 w-4 h-4 group-hover/link:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 bg-[var(--deep-charcoal)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-4xl md:text-5xl mb-6"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Rejoignez-nous
          </h2>
          <p
            className="text-xl text-[var(--off-white)] mb-8 leading-relaxed"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Vivez l'experience unique d'un spectacle de la Compagnie Culturelle JDR.
            Reservez vos places des maintenant.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/spectacles"
              className="inline-flex items-center justify-center px-8 py-4 rounded-md transition-all duration-300 hover:scale-105"
              style={{
                backgroundColor: 'var(--yellow-primary)',
                color: 'var(--deep-charcoal)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
              }}
            >
              Nos spectacles
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center px-8 py-4 rounded-md border-2 transition-all duration-300"
              style={{
                borderColor: 'var(--blue-primary)',
                backgroundColor: 'var(--blue-primary)',
                color: 'var(--white)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--blue-dark)';
                e.currentTarget.style.borderColor = 'var(--blue-dark)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--blue-primary)';
                e.currentTarget.style.borderColor = 'var(--blue-primary)';
              }}
            >
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}