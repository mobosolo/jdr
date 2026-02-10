import { useEffect, useState } from 'react';
import { Calendar, MapPin, Clock, Users } from 'lucide-react';

type ShowStatus = 'upcoming' | 'past';

interface Show {
  id: number;
  title: string;
  subtitle: string;
  image: string | null;
  status: ShowStatus;
  date: string;
  location: string;
  duration: string;
  capacity: string;
  description: string;
}

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function Spectacles() {
  const [filter, setFilter] = useState<'all' | ShowStatus>('all');
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadShows = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBase}/api/shows`);
        if (!response.ok) {
          throw new Error(`Erreur API: ${response.status}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Reponse invalide du serveur.');
        }
        if (isMounted) {
          setShows(data);
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

    loadShows();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredShows = filter === 'all' ? shows : shows.filter((show) => show.status === filter);

  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 bg-gradient-to-b from-[var(--deep-charcoal)] to-[var(--charcoal-light)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1
              className="text-5xl md:text-6xl mb-6"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Nos Spectacles
            </h1>
            <p
              className="text-xl text-[var(--off-white)] max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Decouvrez notre programmation de spectacles et la richesse des arts de la scene.
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2.5 rounded-md transition-all duration-200 ${
                filter === 'all'
                  ? 'bg-[var(--gold)] text-[var(--deep-charcoal)]'
                  : 'bg-[var(--muted)] text-[var(--charcoal-lighter)] hover:bg-[var(--gold)]/20'
              }`}
              style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}
            >
              Tous les spectacles
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-6 py-2.5 rounded-md transition-all duration-200 ${
                filter === 'upcoming'
                  ? 'bg-[var(--gold)] text-[var(--deep-charcoal)]'
                  : 'bg-[var(--muted)] text-[var(--charcoal-lighter)] hover:bg-[var(--gold)]/20'
              }`}
              style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}
            >
              A venir
            </button>
            <button
              onClick={() => setFilter('past')}
              className={`px-6 py-2.5 rounded-md transition-all duration-200 ${
                filter === 'past'
                  ? 'bg-[var(--gold)] text-[var(--deep-charcoal)]'
                  : 'bg-[var(--muted)] text-[var(--charcoal-lighter)] hover:bg-[var(--gold)]/20'
              }`}
              style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}
            >
              Passes
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--off-white)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading && (
            <div className="text-center text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Chargement des spectacles...
            </div>
          )}
          {!isLoading && error && (
            <div className="text-center text-red-600" style={{ fontFamily: 'var(--font-sans)' }}>
              Erreur: {error}
            </div>
          )}
          {!isLoading && !error && filteredShows.length === 0 && (
            <div className="text-center text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Aucun spectacle pour le moment.
            </div>
          )}
          {!isLoading && !error && filteredShows.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredShows.map((show) => (
                <article
                  key={show.id}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 group"
                >
                  <div className="relative h-80 overflow-hidden">
                    {show.image ? (
                      <img
                        src={show.image}
                        alt={show.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-[var(--charcoal-light)] flex items-center justify-center">
                        <span className="text-sm text-[var(--off-white)]" style={{ fontFamily: 'var(--font-sans)' }}>
                          Image indisponible
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-4 py-1.5 rounded-full text-sm ${
                          show.status === 'upcoming'
                            ? 'bg-[var(--gold)] text-[var(--deep-charcoal)]'
                            : 'bg-[var(--muted)] text-[var(--charcoal-lighter)]'
                        }`}
                        style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}
                      >
                        {show.status === 'upcoming' ? 'A venir' : 'Passe'}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p
                        className="text-[var(--gold)] text-sm mb-2"
                        style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}
                      >
                        {show.subtitle}
                      </p>
                      <h3
                        className="text-3xl text-white mb-2"
                        style={{ fontFamily: 'var(--font-serif)' }}
                      >
                        {show.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p
                      className="text-[var(--charcoal-lighter)] mb-4 leading-relaxed"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      {show.description}
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center space-x-3 text-sm">
                        <Calendar className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                        <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--deep-charcoal)' }}>
                          {show.date}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <MapPin className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                        <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--deep-charcoal)' }}>
                          {show.location}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <Clock className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                        <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--deep-charcoal)' }}>
                          {show.duration}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-sm">
                        <Users className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                        <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--deep-charcoal)' }}>
                          {show.capacity}
                        </span>
                      </div>
                    </div>
                    {show.status === 'upcoming' && (
                      <button
                        className="w-full py-3 rounded-md transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor: 'var(--gold)',
                          color: 'var(--deep-charcoal)',
                          fontFamily: 'var(--font-sans)',
                          fontWeight: 500,
                        }}
                      >
                        Reserver
                      </button>
                    )}
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
