import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import logo from '../../assets/jdr-logo.jpg';

export function Footer() {
  return (
    <footer className="bg-[var(--deep-charcoal)] text-[var(--off-white)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <img
                src={logo}
                alt="Logo Compagnie Culturelle JDR"
                className="w-16 h-16 rounded-full object-cover mb-3"
              />
              <span
                className="text-2xl tracking-tight block"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Compagnie
              </span>
              <span
                className="text-2xl tracking-tight block"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                Culturelle
              </span>
              <span
                className="text-sm tracking-widest"
                style={{ fontFamily: 'var(--font-sans)', color: 'var(--gold)' }}
              >
                JDR
              </span>
            </div>
            <p className="text-sm text-[var(--charcoal-lighter)] leading-relaxed" style={{ fontFamily: 'var(--font-sans)' }}>
              Une compagnie professionnelle dediee aux arts de la scene et au theatre contemporain.
            </p>
          </div>

          <div>
            <h3
              className="text-lg mb-4"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold)' }}
            >
              Navigation
            </h3>
            <ul className="space-y-2" style={{ fontFamily: 'var(--font-sans)' }}>
              <li>
                <Link
                  to="/"
                  className="text-sm text-[var(--charcoal-lighter)] hover:text-[var(--gold)] transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  to="/spectacles"
                  className="text-sm text-[var(--charcoal-lighter)] hover:text-[var(--gold)] transition-colors"
                >
                  Spectacles
                </Link>
              </li>
              <li>
                <Link
                  to="/medias"
                  className="text-sm text-[var(--charcoal-lighter)] hover:text-[var(--gold)] transition-colors"
                >
                  Medias
                </Link>
              </li>
              <li>
                <Link
                  to="/actualites"
                  className="text-sm text-[var(--charcoal-lighter)] hover:text-[var(--gold)] transition-colors"
                >
                  Actualites
                </Link>
              </li>
              <li>
                <Link
                  to="/a-propos"
                  className="text-sm text-[var(--charcoal-lighter)] hover:text-[var(--gold)] transition-colors"
                >
                  A Propos
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-[var(--charcoal-lighter)] hover:text-[var(--gold)] transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3
              className="text-lg mb-4"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold)' }}
            >
              Contact
            </h3>
            <ul className="space-y-3" style={{ fontFamily: 'var(--font-sans)' }}>
              <li className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" style={{ color: 'var(--gold)' }} />
                <span className="text-sm text-[var(--charcoal-lighter)]">
                  123 Rue du Theatre<br />75001 Paris, France
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gold)' }} />
                <span className="text-sm text-[var(--charcoal-lighter)]">+33 1 23 45 67 89</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--gold)' }} />
                <span className="text-sm text-[var(--charcoal-lighter)]">contact@compagnie-jdr.fr</span>
              </li>
            </ul>
          </div>

          <div>
            <h3
              className="text-lg mb-4"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--gold)' }}
            >
              Suivez-nous
            </h3>
            <p className="text-sm text-[var(--charcoal-lighter)] mb-4" style={{ fontFamily: 'var(--font-sans)' }}>
              Retrouvez nos actualites et coulisses sur les reseaux sociaux.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[var(--charcoal-light)] hover:bg-[var(--gold)] transition-colors group"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-[var(--off-white)] group-hover:text-[var(--deep-charcoal)]" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[var(--charcoal-light)] hover:bg-[var(--gold)] transition-colors group"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5 text-[var(--off-white)] group-hover:text-[var(--deep-charcoal)]" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-[var(--charcoal-light)] hover:bg-[var(--gold)] transition-colors group"
                aria-label="YouTube"
              >
                <Youtube className="w-5 h-5 text-[var(--off-white)] group-hover:text-[var(--deep-charcoal)]" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-[var(--charcoal-light)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-center text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
            Copyright {new Date().getFullYear()} Compagnie Culturelle JDR. Tous droits reserves.
          </p>
        </div>
      </div>
    </footer>
  );
}
