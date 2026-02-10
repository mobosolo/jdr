import { useEffect, useState } from 'react';
import { adminFetch } from '../lib/adminFetch';

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

const emptyForm = {
  title: '',
  subtitle: '',
  status: 'upcoming' as ShowStatus,
  date: '',
  location: '',
  duration: '',
  capacity: '',
  description: '',
};

export function AdminSpectacles() {
  const [form, setForm] = useState(emptyForm);
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadShows = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/shows`);
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Reponse invalide du serveur.');
      }
      setShows(data);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erreur inconnue',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadShows();
  }, []);

  const updateField = (field: keyof typeof emptyForm) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (show: Show) => {
    setForm({
      title: show.title,
      subtitle: show.subtitle,
      status: show.status,
      date: show.date,
      location: show.location,
      duration: show.duration,
      capacity: show.capacity,
      description: show.description,
    });
    setIsEditing(true);
    setEditingId(show.id);
    setMessage(null);
  };

  const handleDelete = async (show: Show) => {
    if (!window.confirm(`Supprimer le spectacle "${show.title}" ?`)) {
      return;
    }
    setMessage(null);
    try {
      const response = await adminFetch(`${apiBase}/api/shows/${show.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Erreur API: ${response.status}`);
      }
      setShows((prev) => prev.filter((item) => item.id !== show.id));
      if (editingId === show.id) {
        resetForm();
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erreur inconnue',
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await adminFetch(
        isEditing && editingId ? `${apiBase}/api/shows/${editingId}` : `${apiBase}/api/shows`,
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Erreur API: ${response.status}`);
      }

      const saved = (await response.json()) as Show;

      if (isEditing) {
        setShows((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
        setMessage({ type: 'success', text: 'Spectacle modifie avec succes.' });
      } else {
        setShows((prev) => [saved, ...prev]);
        setMessage({ type: 'success', text: 'Spectacle ajoute avec succes.' });
      }

      resetForm();
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erreur inconnue',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>
              Admin - Spectacles
            </h1>
            <p className="mt-3 text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Ajoutez ou modifiez un spectacle. Une image est choisie aleatoirement depuis la bibliotheque.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                  Titre
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={updateField('title')}
                  className="w-full px-4 py-2 rounded-md border border-[var(--border)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                  Sous-titre
                </label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={updateField('subtitle')}
                  className="w-full px-4 py-2 rounded-md border border-[var(--border)]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                  Statut
                </label>
                <select
                  value={form.status}
                  onChange={updateField('status')}
                  className="w-full px-4 py-2 rounded-md border border-[var(--border)]"
                >
                  <option value="upcoming">A venir</option>
                  <option value="past">Passe</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                  Date (texte)
                </label>
                <input
                  type="text"
                  value={form.date}
                  onChange={updateField('date')}
                  className="w-full px-4 py-2 rounded-md border border-[var(--border)]"
                  placeholder="15-20 Mars 2026"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                  Lieu
                </label>
                <input
                  type="text"
                  value={form.location}
                  onChange={updateField('location')}
                  className="w-full px-4 py-2 rounded-md border border-[var(--border)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                  Duree
                </label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={updateField('duration')}
                  className="w-full px-4 py-2 rounded-md border border-[var(--border)]"
                  placeholder="2h30"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                  Capacite
                </label>
                <input
                  type="text"
                  value={form.capacity}
                  onChange={updateField('capacity')}
                  className="w-full px-4 py-2 rounded-md border border-[var(--border)]"
                  placeholder="400 places"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                Description
              </label>
              <textarea
                value={form.description}
                onChange={updateField('description')}
                className="w-full px-4 py-2 rounded-md border border-[var(--border)]"
                rows={4}
                required
              />
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-md transition-all duration-200 hover:scale-105"
                style={{
                  backgroundColor: 'var(--gold)',
                  color: 'var(--deep-charcoal)',
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500,
                }}
              >
                {isSubmitting ? 'Envoi...' : isEditing ? 'Modifier le spectacle' : 'Ajouter le spectacle'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 rounded-md border border-[var(--border)]"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  Annuler
                </button>
              )}
              {message && (
                <span
                  className={message.type === 'success' ? 'text-green-700' : 'text-red-600'}
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {message.text}
                </span>
              )}
            </div>
          </form>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl mb-6" style={{ fontFamily: 'var(--font-serif)' }}>
            Spectacles existants
          </h2>
          {isLoading && (
            <div className="text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Chargement...
            </div>
          )}
          {!isLoading && shows.length === 0 && (
            <div className="text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Aucun spectacle en base pour le moment.
            </div>
          )}
          {!isLoading && shows.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shows.map((show) => (
                <article key={show.id} className="bg-white rounded-lg shadow-md p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
                        {show.title}
                      </h3>
                      <p className="text-sm text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                        {show.subtitle}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        show.status === 'upcoming'
                          ? 'bg-[var(--gold)] text-[var(--deep-charcoal)]'
                          : 'bg-[var(--muted)] text-[var(--charcoal-lighter)]'
                      }`}
                      style={{ fontFamily: 'var(--font-sans)', fontWeight: 600 }}
                    >
                      {show.status === 'upcoming' ? 'A venir' : 'Passe'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                    {show.description}
                  </p>
                  <div className="mt-4 text-sm text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                    <div>{show.date}</div>
                    <div>{show.location}</div>
                    <div>{show.duration} - {show.capacity}</div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(show)}
                      className="px-4 py-2 rounded-md border border-[var(--border)]"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(show)}
                      className="px-4 py-2 rounded-md text-white bg-red-600"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Supprimer
                    </button>
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
