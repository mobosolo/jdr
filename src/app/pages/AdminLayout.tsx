import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { adminFetch } from '../lib/adminFetch';

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${apiBase}/api/admin/me`, { credentials: 'include' });
        if (!response.ok) {
          throw new Error('Unauthorized');
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erreur inconnue');
          navigate('/admin/login', { replace: true, state: { from: location.pathname } });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [location.pathname, navigate]);

  const handleLogout = async () => {
    try {
      await adminFetch(`${apiBase}/api/admin/logout`, { method: 'POST' });
    } finally {
      navigate('/admin/login', { replace: true });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-20 bg-[var(--off-white)] flex items-center justify-center">
        <span style={{ fontFamily: 'var(--font-sans)', color: 'var(--charcoal-lighter)' }}>
          Verification...
        </span>
      </div>
    );
  }

  if (error) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <header className="border-b border-[var(--border)] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1
              className="text-2xl"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--deep-charcoal)' }}
            >
              Administration
            </h1>
            <p className="text-sm text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Compagnie Culturelle JDR
            </p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2 rounded-md border border-[var(--border)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Se deconnecter
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="flex flex-wrap gap-3 mb-8">
          <Link
            to="/admin/spectacles"
            className="px-4 py-2 rounded-md border border-[var(--border)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Spectacles
          </Link>
          <Link
            to="/admin/medias"
            className="px-4 py-2 rounded-md border border-[var(--border)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Medias
          </Link>
          <Link
            to="/admin/actualites"
            className="px-4 py-2 rounded-md border border-[var(--border)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Actualites
          </Link>
          <Link
            to="/admin/messages"
            className="px-4 py-2 rounded-md border border-[var(--border)]"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            Messages
          </Link>
        </nav>

        <Outlet />
      </div>
    </div>
  );
}
