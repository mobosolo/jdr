import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../../assets/jdr-logo.jpg";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Accueil", path: "/" },
    { name: "Spectacles", path: "/spectacles" },
    { name: "Actualités", path: "/actualites" },
    { name: "Médias", path: "/medias" },
    { name: "À Propos", path: "/a-propos" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/90 backdrop-blur-lg shadow-md"
          : "bg-white/70 backdrop-blur-md"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src={logo}
              alt="Compagnie Culturelle JDR"
              className="h-14 w-auto transition-transform duration-300 group-hover:scale-105"
            />
            <div className="hidden sm:flex flex-col">
              <span
                className="text-lg tracking-tight leading-tight"
                style={{
                  fontFamily: "var(--font-serif)",
                  color: "var(--deep-charcoal)",
                }}
              >
                Compagnie Culturelle
              </span>
              <span
                className="text-xs tracking-widest uppercase"
                style={{
                  fontFamily: "var(--font-sans)",
                  color: "var(--blue-primary)",
                  fontWeight: 600,
                }}
              >
                JDR
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-2 transition-colors duration-200 ${
                  isActive(link.path)
                    ? "text-[var(--blue-primary)]"
                    : "text-[var(--charcoal-lighter)] hover:text-[var(--blue-primary)]"
                }`}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: isActive(link.path) ? 600 : 500,
                }}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--yellow-primary)]" />
                )}
              </Link>
            ))}
            <Link
              to="/contact"
              className="px-6 py-2.5 rounded-md transition-all duration-200 hover:scale-105 hover:shadow-lg"
              style={{
                backgroundColor: "var(--yellow-primary)",
                color: "var(--deep-charcoal)",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
              }}
            >
              Contact
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" style={{ color: "var(--blue-primary)" }} />
            ) : (
              <Menu
                className="w-6 h-6"
                style={{ color: "var(--blue-primary)" }}
              />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden bg-white/95 backdrop-blur-lg border-t"
          style={{ borderColor: "var(--border)" }}
        >
          <nav className="flex px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 px-4 rounded-md transition-colors ${
                  isActive(link.path)
                    ? ""
                    : "text-[var(--charcoal-lighter)] hover:bg-[var(--muted)]"
                }`}
                style={{
                  fontFamily: "var(--font-sans)",
                  ...(isActive(link.path)
                    ? {
                        backgroundColor: "var(--blue-primary)",
                        color: "var(--white)",
                        fontWeight: 600,
                      }
                    : {}),
                }}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2.5 px-4 rounded-md text-center"
              style={{
                backgroundColor: "var(--yellow-primary)",
                color: "var(--deep-charcoal)",
                fontFamily: "var(--font-sans)",
                fontWeight: 600,
              }}
            >
              Contact
            </Link>
            <p className="text-7xl text-black">cc</p>
          </nav>
        </div>
      )}
    </header>
  );
}
