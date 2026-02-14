import { useEffect, useState } from 'react';
import { adminFetch } from '../lib/adminFetch';

interface MediaPhoto {
  id: string;
  url: string;
  title: string | null;
}

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function AdminMedias() {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [photos, setPhotos] = useState<MediaPhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadPhotos = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/media/photos`);
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Reponse invalide du serveur.');
      }
      setPhotos(data);
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
    loadPhotos();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!url.trim()) {
      setMessage({ type: 'error', text: 'Entrez une URL image.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await adminFetch('/api/media/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), title: title.trim() || null }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Erreur API: ${response.status}`);
      }

      const created = (await response.json()) as MediaPhoto;
      setPhotos((prev) => [created, ...prev]);
      setTitle('');
      setUrl('');
      setMessage({ type: 'success', text: 'Photo ajoutee avec succes.' });
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erreur inconnue',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (photo: MediaPhoto) => {
    if (!window.confirm('Supprimer cette photo ?')) {
      return;
    }
    setMessage(null);
    try {
      const response = await adminFetch(`/api/media/photos/${photo.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Erreur API: ${response.status}`);
      }
      setPhotos((prev) => prev.filter((item) => item.id !== photo.id));
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erreur inconnue',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[var(--off-white)]">
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>
              Admin - Medias
            </h1>
            <p className="mt-3 text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Ajoutez des photos par URL pour la galerie Medias.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                  Titre (optionnel)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-[var(--border)]"
                />
              </div>
              <div>
                <label className="block text-sm mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                  URL image
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  className="w-full px-4 py-2 rounded-md border border-[var(--border)]"
                  required
                />
              </div>
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
                {isSubmitting ? 'Envoi...' : 'Ajouter la photo'}
              </button>
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
            Photos existantes
          </h2>
          {isLoading && (
            <div className="text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Chargement...
            </div>
          )}
          {!isLoading && photos.length === 0 && (
            <div className="text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Aucune photo pour le moment.
            </div>
          )}
          {!isLoading && photos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {photos.map((photo) => (
                <article key={photo.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <img src={photo.url} alt={photo.title ?? 'Photo'} className="w-full h-56 object-cover" loading="lazy" />
                  <div className="p-4">
                    <div className="text-sm text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                      {photo.title ?? 'Sans titre'}
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(photo)}
                        className="px-4 py-2 rounded-md text-white bg-red-600"
                        style={{ fontFamily: 'var(--font-sans)' }}
                      >
                        Supprimer
                      </button>
                    </div>
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
