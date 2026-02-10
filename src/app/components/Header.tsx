import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../../assets/jdr-logo.jpg';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Spectacles', path: '/spectacles' },
    { name: 'ActualitÃ©s', path: '/actualites' },
    { name: 'Médias', path: '/medias' },
    { name: 'À Propos', path: '/a-propos' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/80 backdrop-blur-lg shadow-md'
          : 'bg-white/60 backdrop-blur-md'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo Compagnie Culturelle JDR"
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <span
                className="text-2xl tracking-tight"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--deep-charcoal)' }}
              >
                Compagnie Culturelle
              </span>
              <span
                className="text-sm tracking-widest"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--gold)' }}
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
                    ? 'text-[var(--deep-charcoal)]'
                    : 'text-[var(--charcoal-lighter)] hover:text-[var(--deep-charcoal)]'
                }`}
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {link.name}
                {isActive(link.path) && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--gold)]" />
                )}
              </Link>
            ))}
            <Link
              to="/contact"
              className="px-6 py-2.5 rounded-md transition-all duration-200 hover:scale-105"
              style={{
                backgroundColor: 'var(--gold)',
                color: 'var(--deep-charcoal)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
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
              <X className="w-6 h-6" style={{ color: 'var(--deep-charcoal)' }} />
            ) : (
              <Menu className="w-6 h-6" style={{ color: 'var(--deep-charcoal)' }} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-[var(--border)]">
          <nav className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block py-2 px-4 rounded-md transition-colors ${
                  isActive(link.path)
                    ? 'bg-[var(--gold)]/10 text-[var(--deep-charcoal)]'
                    : 'text-[var(--charcoal-lighter)] hover:bg-[var(--muted)]'
                }`}
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2.5 px-4 rounded-md text-center"
              style={{
                backgroundColor: 'var(--gold)',
                color: 'var(--deep-charcoal)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
              }}
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
