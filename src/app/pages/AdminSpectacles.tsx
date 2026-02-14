import { useEffect, useState } from 'react';
import { adminFetch } from '../lib/adminFetch';

interface Show {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
}

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const emptyForm = {
  title: '',
  location: '',
  startDate: '',
  endDate: '',
  description: '',
};

export function AdminSpectacles() {
  const [form, setForm] = useState(emptyForm);
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

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
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
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
      location: show.location,
      startDate: show.startDate.slice(0, 10),
      endDate: show.endDate.slice(0, 10),
      description: show.description,
    });
    setIsEditing(true);
    setEditingId(show.id);
    setMessage(null);
  };

  const handleDelete = async (show: Show) => {
    if (!window.confirm(`Supprimer le spectacle \"${show.title}\" ?`)) {
      return;
    }
    setMessage(null);
    try {
      const response = await adminFetch(`/api/shows/${show.id}`, { method: 'DELETE' });
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
      const payload = {
        title: form.title.trim(),
        location: form.location.trim(),
        description: form.description.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
      };

      const response = await adminFetch(
        isEditing && editingId ? `/api/shows/${editingId}` : '/api/shows',
        {
          method: isEditing ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
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
              Ajoutez ou modifiez un spectacle.
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                  Date debut
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={updateField('startDate')}
                  className="w-full px-4 py-2 rounded-md border border-[var(--border)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                  Date fin
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={updateField('endDate')}
                  className="w-full px-4 py-2 rounded-md border border-[var(--border)]"
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
                <span className={message.type === 'success' ? 'text-green-700' : 'text-red-600'} style={{ fontFamily: 'var(--font-sans)' }}>
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
                  <h3 className="text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
                    {show.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                    {show.location}
                  </p>
                  <p className="text-sm text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                    {new Date(show.startDate).toLocaleDateString('fr-FR')} - {new Date(show.endDate).toLocaleDateString('fr-FR')}
                  </p>
                  <p className="mt-3 text-sm text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                    {show.description}
                  </p>
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
