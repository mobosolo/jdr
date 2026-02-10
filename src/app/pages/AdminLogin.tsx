import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminFetch } from '../lib/adminFetch';

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await adminFetch(`${apiBase}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Erreur API: ${response.status}`);
      }

      const target = (location.state && location.state.from) ? location.state.from : '/admin/spectacles';
      navigate(target, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-[var(--off-white)]">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1
            className="text-3xl mb-3"
            style={{ fontFamily: 'var(--font-serif)', color: 'var(--deep-charcoal)' }}
          >
            Connexion Admin
          </h1>
          <p className="text-sm text-[var(--charcoal-lighter)] mb-6" style={{ fontFamily: 'var(--font-sans)' }}>
            Entrez vos identifiants pour acceder a l'administration.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                Utilisateur
              </label>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full px-4 py-2 rounded-md border border-[var(--border)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full px-4 py-2 rounded-md border border-[var(--border)]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-md transition-all duration-200 hover:scale-105 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--gold)',
                color: 'var(--deep-charcoal)',
                fontFamily: 'var(--font-sans)',
                fontWeight: 500,
              }}
            >
              {isSubmitting ? 'Connexion...' : 'Se connecter'}
            </button>
            {error && (
              <p className="text-sm text-red-600" style={{ fontFamily: 'var(--font-sans)' }}>
                {error}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
