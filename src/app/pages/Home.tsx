import { useEffect, useState } from "react";
import Slider from "react-slick";
import { ChevronRight, Calendar, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

// Types alignÃ©s sur Prisma
interface NewsItem {
  id: string;
  title: string;
  content: string;
  publishedAt: string;
  images: { url: string; alt: string | null }[];
}

const apiBase = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export function Home() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Configuration du Slider (identique Ã  ton souhait)
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    fade: true,
  };

  const heroSlides = [
    {
      image:
        "https://images.unsplash.com/photo-1767294274254-57367fa62236?q=80&w=1080",
      title: "L'Art de la ScÃ¨ne",
      subtitle: "DÃ©couvrez nos spectacles exceptionnels",
    },
  ];

  useEffect(() => {
    fetch(`${apiBase}/api/news?limit=3`)
      .then((res) => res.json())
      .then((data) => {
        setNews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[var(--white)]">
      {/* --- HERO SLIDER --- */}
      <section className="relative h-[90vh]">
        <Slider {...sliderSettings} className="h-full">
          {heroSlides.map((slide, i) => (
            <div key={i} className="relative h-[90vh]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-black/40" />
              </div>
              <div className="relative h-full flex items-center justify-center text-center text-white px-4">
                <div className="max-w-3xl">
                  <h1 className="text-5xl md:text-7xl font-serif mb-6">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 opacity-90">
                    {slide.subtitle}
                  </p>
                  <Link
                    to="/spectacles"
                    className="inline-block bg-[var(--yellow-primary)] text-[var(--deep-charcoal)] px-8 py-4 rounded font-bold hover:scale-105 transition-transform"
                  >
                    Voir la programmation
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </section>

      {/* --- SECTION ACTUALITÃ‰S --- */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-serif text-[var(--deep-charcoal)]">
              ActualitÃ©s
            </h2>
            <div className="w-20 h-1 bg-[var(--blue-primary)] mt-2" />
          </div>
          <Link
            to="/actualites"
            className="text-[var(--blue-primary)] font-bold flex items-center hover:underline"
          >
            Toute l'actualitÃ© <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 bg-gray-100 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {news.map((item) => (
              <article
                key={item.id}
                className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all border border-gray-100 overflow-hidden"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={
                      item.images[0]?.url ||
                      "https://via.placeholder.com/400x300"
                    }
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-bold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[var(--blue-primary)]" />
                    {new Date(item.publishedAt).toLocaleDateString("fr-FR")}
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-serif font-bold mb-3 line-clamp-2 text-[var(--deep-charcoal)]">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {item.content}
                  </p>
                  <Link
                    to={`/actualites/${item.id}`}
                    className="text-[var(--blue-primary)] text-sm font-bold flex items-center gap-1 group/btn"
                  >
                    Lire la suite
                    <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* --- CALL TO ACTION --- */}
      <section className="bg-[var(--deep-charcoal)] py-16 text-center text-white">
        <h2 className="text-3xl font-serif mb-4">
          Une question sur nos tarifs ?
        </h2>
        <p className="mb-8 opacity-80">
          Notre Ã©quipe est Ã  votre disposition pour toute demande de
          rÃ©servation.
        </p>
        <Link
          to="/contact"
          className="border-2 border-[var(--yellow-primary)] text-[var(--yellow-primary)] px-8 py-3 rounded-md font-bold hover:bg-[var(--yellow-primary)] hover:text-[var(--deep-charcoal)] transition-all"
        >
          Nous contacter
        </Link>
      </section>
    </div>
  );
}

