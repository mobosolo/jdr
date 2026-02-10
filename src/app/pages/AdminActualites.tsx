import { useEffect, useState } from 'react';
import { adminFetch } from '../lib/adminFetch';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  content: string | null;
  image: string | null;
}

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

const emptyForm = {
  title: '',
  date: '',
  excerpt: '',
  content: '',
};

export function AdminActualites() {
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [shows, setShows] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);

  const loadNews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiBase}/api/news`);
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
    loadNews();
  }, []);

  const updateField = (field: keyof typeof emptyForm) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setImageFile(null);
    setIsEditing(false);
    setEditingId(null);
    setExistingImage(null);
    setRemoveImage(false);
  };

  const handleEdit = (item: NewsItem) => {
    setForm({
      title: item.title,
      date: item.date,
      excerpt: item.excerpt,
      content: item.content ?? '',
    });
    setExistingImage(item.image);
    setRemoveImage(false);
    setImageFile(null);
    setIsEditing(true);
    setEditingId(item.id);
    setMessage(null);
  };

  const handleDelete = async (item: NewsItem) => {
    if (!window.confirm(`Supprimer l'actualite "${item.title}" ?`)) {
      return;
    }
    setMessage(null);
    try {
      const response = await adminFetch(`${apiBase}/api/news/${item.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Erreur API: ${response.status}`);
      }
      setShows((prev) => prev.filter((news) => news.id !== item.id));
      if (editingId === item.id) {
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
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('date', form.date);
      formData.append('excerpt', form.excerpt);
      if (form.content.trim()) {
        formData.append('content', form.content.trim());
      }
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (isEditing) {
        formData.append('removeImage', String(removeImage));
      }

      const response = await adminFetch(
        isEditing && editingId ? `${apiBase}/api/news/${editingId}` : `${apiBase}/api/news`,
        {
          method: isEditing ? 'PUT' : 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Erreur API: ${response.status}`);
      }

      const saved = (await response.json()) as NewsItem;

      if (isEditing) {
        setShows((prev) => prev.map((item) => (item.id === saved.id ? saved : item)));
        setMessage({ type: 'success', text: 'Actualite modifiee avec succes.' });
      } else {
        setShows((prev) => [saved, ...prev]);
        setMessage({ type: 'success', text: 'Actualite ajoutee avec succes.' });
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
              Admin - Actualites
            </h1>
            <p className="mt-3 text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Ajoutez ou modifiez une actualite. L'image est optionnelle.
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
                  Date (texte)
                </label>
                <input
                  type="text"
                  value={form.date}
                  onChange={updateField('date')}
                  className="w-full px-4 py-2 rounded-md border border-[var(--border)]"
                  placeholder="15 Janvier 2026"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                Extrait
              </label>
              <textarea
                value={form.excerpt}
                onChange={updateField('excerpt')}
                className="w-full px-4 py-2 rounded-md border border-[var(--border)]"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                Contenu (optionnel)
              </label>
              <textarea
                value={form.content}
                onChange={updateField('content')}
                className="w-full px-4 py-2 rounded-md border border-[var(--border)]"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
                Image (optionnelle)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  setImageFile(file);
                }}
                className="w-full"
              />
              {isEditing && existingImage && !removeImage && (
                <div className="mt-2 text-sm text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                  Image actuelle: {existingImage}
                </div>
              )}
              {isEditing && existingImage && (
                <label className="mt-2 flex items-center gap-2 text-sm" style={{ fontFamily: 'var(--font-sans)' }}>
                  <input
                    type="checkbox"
                    checked={removeImage}
                    onChange={(event) => setRemoveImage(event.target.checked)}
                  />
                  Supprimer l'image actuelle
                </label>
              )}
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
                {isSubmitting ? 'Envoi...' : isEditing ? "Modifier l'actualite" : "Ajouter l'actualite"}
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
            Actualites existantes
          </h2>
          {isLoading && (
            <div className="text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Chargement...
            </div>
          )}
          {!isLoading && shows.length === 0 && (
            <div className="text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Aucune actualite pour le moment.
            </div>
          )}
          {!isLoading && shows.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {shows.map((item) => (
                <article key={item.id} className="bg-white rounded-lg shadow-md p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
                        {item.title}
                      </h3>
                      <p className="text-sm text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                        {item.date}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                    {item.excerpt}
                  </p>
                  {item.content && (
                    <p className="mt-3 text-sm text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                      {item.content}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="px-4 py-2 rounded-md border border-[var(--border)]"
                      style={{ fontFamily: 'var(--font-sans)' }}
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
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
