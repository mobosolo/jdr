import { useEffect, useState } from "react";
import { Calendar, ChevronLeft, Loader2, AlertCircle } from "lucide-react";
import { Link, useParams } from "react-router-dom";

// Interface alignée sur ton schéma Prisma (ID = String)
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

export function ActualiteDetail() {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadNews = async () => {
      if (!id) {
        setError("ID de l'article manquant dans l'URL.");
        setIsLoading(false);
        return;
      }

      console.log(`🔍 Tentative de récupération de l'article ID: ${id}`);
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBase}/api/news/${id}`);

        console.log(`📡 Statut de la réponse API: ${response.status}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Cet article n'existe pas en base de données.");
          }
          throw new Error(`Erreur serveur (${response.status})`);
        }

        const data = await response.json();
        console.log("✅ Données reçues:", data);

        if (isMounted) {
          setNews(data);
        }
      } catch (err) {
        console.error("❌ Erreur lors du fetch:", err);
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
  }, [id]);

  // --- Écran de chargement ---
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--off-white)]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--blue-primary)] mb-4" />
        <p className="font-sans text-gray-500">Chargement de l'actualité...</p>
      </div>
    );
  }

  // --- Écran d'erreur ---
  if (error || !news) {
    return (
      <div className="min-h-screen pt-32 flex flex-col items-center bg-[var(--off-white)] px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2 font-serif">
            Oups ! Article introuvable
          </h2>
          <p className="text-gray-600 mb-6 font-sans">
            {error || "Nous ne trouvons pas l'article demandé."}
          </p>
          <Link
            to="/actualites"
            className="inline-block px-6 py-2 bg-[var(--blue-primary)] text-white rounded-lg font-bold hover:bg-[var(--blue-dark)] transition-colors"
          >
            Retourner aux actualités
          </Link>
        </div>
      </div>
    );
  }

  // Sécurité Image
  const mainImage =
    news.images && news.images.length > 0 ? news.images[0] : null;

  return (
    <div className="min-h-screen pt-20 bg-[var(--off-white)]">
      {/* Fil d'Ariane / Retour */}
      <nav className="py-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/actualites"
          className="inline-flex items-center text-[var(--blue-primary)] hover:translate-x-[-4px] transition-transform font-bold font-sans"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Toutes les actualités
        </Link>
      </nav>

      <section className="pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
            {/* Header Image Section */}
            <div className="relative h-[300px] md:h-[450px] bg-gray-200">
              {mainImage ? (
                <img
                  src={mainImage.url}
                  alt={mainImage.alt || news.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-500 italic">
                  Image non disponible
                </div>
              )}

              {/* Badge flottant pour la date */}
              <div
                className="absolute -bottom-4 right-8 px-6 py-3 rounded-xl shadow-xl flex items-center gap-3"
                style={{ backgroundColor: "var(--yellow-primary)" }}
              >
                <Calendar className="w-5 h-5 text-[var(--deep-charcoal)]" />
                <span className="text-[var(--deep-charcoal)] font-bold font-sans">
                  {new Date(news.publishedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>

            <div className="p-8 md:p-16">
              <h1
                className="text-4xl md:text-5xl lg:text-6xl mb-10 leading-tight"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--deep-charcoal)",
                }}
              >
                {news.title}
              </h1>

              {/* Corps de l'article */}
              <div className="text-[var(--charcoal-lighter)] leading-relaxed text-lg md:text-xl font-sans space-y-8 whitespace-pre-wrap">
                {news.content}
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
