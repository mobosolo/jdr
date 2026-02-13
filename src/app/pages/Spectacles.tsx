import { useEffect, useState } from "react";
import { Calendar, MapPin, Clock, Users } from "lucide-react";

// 1. Types alignés sur ton schéma Prisma
interface Show {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  startDate: string;
  location: string;
  duration: string;
  capacity: string;
  images: {
    url: string;
    alt: string | null;
  }[];
}

// const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';
const apiBase = "http://localhost:4000";

export function Spectacles() {
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all");
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadShows = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${apiBase}/api/shows`);
        if (!response.ok) throw new Error(`Erreur API: ${response.status}`);
        const data = await response.json();
        if (isMounted) setShows(data);
      } catch (err) {
        if (isMounted)
          setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadShows();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Logique de filtrage basée sur la date actuelle
  const now = new Date();
  const filteredShows = shows.filter((show) => {
    const showDate = new Date(show.startDate);
    if (filter === "upcoming") return showDate >= now;
    if (filter === "past") return showDate < now;
    return true;
  });

  return (
    <div className="min-h-screen pt-20">
      {/* --- Header --- */}
      <section className="py-20 bg-gradient-to-b from-[var(--deep-charcoal)] to-[var(--charcoal-light)] text-white text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-5xl md:text-6xl mb-6 font-serif">
            Nos Spectacles
          </h1>
          <p className="text-xl text-[var(--off-white)] max-w-3xl mx-auto font-sans opacity-90">
            Découvrez notre programmation et la richesse des arts de la scène.
          </p>
        </div>
      </section>

      {/* --- Filtres --- */}
      <section className="py-8 bg-white border-b border-gray-100 sticky top-20 z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-4 justify-center">
          {[
            {
              id: "all",
              label: "Tous les spectacles",
              color: "var(--yellow-primary)",
            },
            { id: "upcoming", label: "À venir", color: "var(--blue-primary)" },
            { id: "past", label: "Passés", color: "var(--charcoal-light)" },
          ].map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id as any)}
              className="px-6 py-2.5 rounded-md font-bold transition-all shadow-sm"
              style={{
                backgroundColor: filter === btn.id ? btn.color : "#f3f4f6",
                color:
                  filter === btn.id
                    ? btn.id === "all"
                      ? "var(--deep-charcoal)"
                      : "white"
                    : "#6b7280",
                fontFamily: "var(--font-sans)",
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </section>

      {/* --- Grille des Spectacles --- */}
      <section className="py-16 bg-[var(--off-white)] min-h-[400px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="text-center py-20 text-gray-500 animate-pulse">
              Chargement de la scène...
            </div>
          ) : error ? (
            <div className="text-center py-20 text-red-600 font-bold">
              {error}
            </div>
          ) : filteredShows.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              Aucun spectacle ne correspond à ce filtre.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredShows.map((show) => {
                const isUpcoming = new Date(show.startDate) >= now;
                const mainImage = show.images?.[0]?.url;

                return (
                  <article
                    key={show.id}
                    className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group"
                  >
                    {/* Image & Overlay */}
                    <div className="relative h-80 overflow-hidden">
                      {mainImage ? (
                        <img
                          src={mainImage}
                          alt={show.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center italic text-gray-400">
                          Image bientôt disponible
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                      {/* Status Badge */}
                      <div
                        className="absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg"
                        style={{
                          backgroundColor: isUpcoming
                            ? "var(--yellow-primary)"
                            : "#4b5563",
                          color: isUpcoming ? "var(--deep-charcoal)" : "white",
                        }}
                      >
                        {isUpcoming ? "À venir" : "Passé"}
                      </div>

                      {/* Title & Subtitle on Image */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <p
                          className="text-sm font-bold mb-1"
                          style={{ color: "var(--yellow-primary)" }}
                        >
                          {show.subtitle}
                        </p>
                        <h3 className="text-3xl text-white font-serif leading-tight">
                          {show.title}
                        </h3>
                      </div>
                    </div>

                    {/* Infos Details */}
                    <div className="p-6">
                      <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed">
                        {show.description}
                      </p>

                      <div className="grid grid-cols-2 gap-y-3 gap-x-2 border-t border-gray-50 pt-6 mb-6">
                        <div className="flex items-center gap-2 text-xs">
                          <Calendar className="w-4 h-4 text-[var(--blue-primary)]" />
                          <span className="font-bold">
                            {new Date(show.startDate).toLocaleDateString(
                              "fr-FR",
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <MapPin className="w-4 h-4 text-[var(--blue-primary)]" />
                          <span className="truncate">{show.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Clock className="w-4 h-4 text-[var(--blue-primary)]" />
                          <span>{show.duration}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <Users className="w-4 h-4 text-[var(--blue-primary)]" />
                          <span>{show.capacity}</span>
                        </div>
                      </div>

                      {isUpcoming && (
                        <button
                          className="w-full py-3 rounded-lg font-bold text-sm uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-95 shadow-md"
                          style={{
                            backgroundColor: "var(--yellow-primary)",
                            color: "var(--deep-charcoal)",
                          }}
                        >
                          Réserver ma place
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
