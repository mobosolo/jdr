import { useEffect, useState } from 'react';
import { adminFetch } from '../lib/adminFetch';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const response = await adminFetch('/api/contact/messages');
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Reponse invalide du serveur.');
      }
      setMessages(data);
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
    loadMessages();
  }, []);

  const handleDelete = async (item: ContactMessage) => {
    if (!window.confirm(`Supprimer le message de ${item.name} ?`)) {
      return;
    }
    setMessage(null);
    try {
      const response = await adminFetch(`/api/contact/messages/${item.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Erreur API: ${response.status}`);
      }
      setMessages((prev) => prev.filter((entry) => entry.id !== item.id));
      setMessage({ type: 'success', text: 'Message supprime.' });
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <h1 className="text-4xl" style={{ fontFamily: 'var(--font-serif)' }}>
              Admin - Messages
            </h1>
            <p className="mt-3 text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Consultez les messages envoyes depuis la page Contact.
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 text-sm ${message.type === 'success' ? 'text-green-700' : 'text-red-600'}`}
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {message.text}
            </div>
          )}

          {isLoading && (
            <div className="text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Chargement...
            </div>
          )}
          {!isLoading && messages.length === 0 && (
            <div className="text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
              Aucun message pour le moment.
            </div>
          )}
          {!isLoading && messages.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {messages.map((item) => (
                <article key={item.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl" style={{ fontFamily: 'var(--font-serif)' }}>
                        {item.name}
                      </h3>
                      <p className="text-sm text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                        {item.email}
                      </p>
                    </div>
                    <div className="text-xs text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                      {new Date(item.created_at).toLocaleString('fr-FR')}
                    </div>
                  </div>
                  <p className="mt-4 text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                    {item.message}
                  </p>
                  <div className="mt-4 flex items-center gap-3">
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
