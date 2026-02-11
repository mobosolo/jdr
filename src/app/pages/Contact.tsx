import { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react';

const apiBase = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      message: '',
    };
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = "L'email est requis";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide';
      isValid = false;
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Le message est requis';
      isValid = false;
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Le message doit contenir au moins 10 caracteres';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch(`${apiBase}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `Erreur API: ${response.status}`);
      }

      setIsSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <section className="py-20 bg-gradient-to-b from-[var(--deep-charcoal)] to-[var(--charcoal-light)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1
              className="text-5xl md:text-6xl mb-6"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Contactez-nous
            </h1>
            <p
              className="text-xl text-[var(--off-white)] max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Nous serions ravis d'echanger avec vous. N'hesitez pas a nous contacter pour toute question
              ou demande d'information.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-[var(--off-white)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2
                className="text-3xl mb-6"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--deep-charcoal)' }}
              >
                Envoyez-nous un message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      color: 'var(--deep-charcoal)',
                      fontWeight: 600,
                    }}
                  >
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-md border-2 transition-all focus:outline-none ${
                      errors.name
                        ? 'border-destructive focus:border-destructive'
                        : 'border-[var(--border)] focus:border-[var(--blue-primary)]'
                    }`}
                    style={{ fontFamily: 'var(--font-sans)' }}
                    placeholder="Votre nom"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-destructive" style={{ fontFamily: 'var(--font-sans)' }}>
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      color: 'var(--deep-charcoal)',
                      fontWeight: 600,
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-md border-2 transition-all focus:outline-none ${
                      errors.email
                        ? 'border-destructive focus:border-destructive'
                        : 'border-[var(--border)] focus:border-[var(--blue-primary)]'
                    }`}
                    style={{ fontFamily: 'var(--font-sans)' }}
                    placeholder="votre@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-destructive" style={{ fontFamily: 'var(--font-sans)' }}>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block mb-2"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      color: 'var(--deep-charcoal)',
                      fontWeight: 600,
                    }}
                  >
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={6}
                    className={`w-full px-4 py-3 rounded-md border-2 transition-all focus:outline-none resize-none ${
                      errors.message
                        ? 'border-destructive focus:border-destructive'
                        : 'border-[var(--border)] focus:border-[var(--blue-primary)]'
                    }`}
                    style={{ fontFamily: 'var(--font-sans)' }}
                    placeholder="Votre message..."
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-destructive" style={{ fontFamily: 'var(--font-sans)' }}>
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitted || isSubmitting}
                  className="w-full py-4 rounded-md transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  style={{
                    backgroundColor: 'var(--blue-primary)',
                    color: 'var(--white)',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 600,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitted && !isSubmitting) {
                      e.currentTarget.style.backgroundColor = 'var(--blue-dark)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitted && !isSubmitting) {
                      e.currentTarget.style.backgroundColor = 'var(--blue-primary)';
                    }
                  }}
                >
                  {isSubmitted ? (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Message envoye !
                    </>
                  ) : isSubmitting ? (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Envoyer le message
                    </>
                  )}
                </button>
                {submitError && (
                  <p className="mt-2 text-sm text-destructive" style={{ fontFamily: 'var(--font-sans)' }}>
                    {submitError}
                  </p>
                )}
              </form>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2
                  className="text-3xl mb-6"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--deep-charcoal)' }}
                >
                  Nos coordonnees
                </h2>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--blue-primary)]/10 flex items-center justify-center">
                      <MapPin className="w-6 h-6" style={{ color: 'var(--blue-primary)' }} />
                    </div>
                    <div>
                      <h3
                        className="text-lg mb-1"
                        style={{
                          fontFamily: 'var(--font-sans)',
                          color: 'var(--deep-charcoal)',
                          fontWeight: 600,
                        }}
                      >
                        Adresse
                      </h3>
                      <p className="text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                        123 Rue du Theatre<br />
                        75001 Paris, France
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--blue-primary)]/10 flex items-center justify-center">
                      <Phone className="w-6 h-6" style={{ color: 'var(--blue-primary)' }} />
                    </div>
                    <div>
                      <h3
                        className="text-lg mb-1"
                        style={{
                          fontFamily: 'var(--font-sans)',
                          color: 'var(--deep-charcoal)',
                          fontWeight: 600,
                        }}
                      >
                        Telephone
                      </h3>
                      <p className="text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                        +33 1 23 45 67 89
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[var(--gold)]/10 flex items-center justify-center">
                      <Mail className="w-6 h-6" style={{ color: 'var(--gold)' }} />
                    </div>
                    <div>
                      <h3
                        className="text-lg mb-1"
                        style={{
                          fontFamily: 'var(--font-sans)',
                          color: 'var(--deep-charcoal)',
                          fontWeight: 600,
                        }}
                      >
                        Email
                      </h3>
                      <p className="text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                        contact@compagnie-jdr.fr
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-[var(--border)]">
                  <h3
                    className="text-lg mb-3"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      color: 'var(--deep-charcoal)',
                      fontWeight: 600,
                    }}
                  >
                    Horaires d'ouverture
                  </h3>
                  <div className="space-y-2 text-[var(--charcoal-lighter)]" style={{ fontFamily: 'var(--font-sans)' }}>
                    <div className="flex justify-between">
                      <span>Lundi - Vendredi</span>
                      <span>9h00 - 18h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Samedi</span>
                      <span>10h00 - 16h00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dimanche</span>
                      <span>Ferme</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-[4/3] bg-[var(--muted)] relative">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2624.9916256937586!2d2.3352255156743493!3d48.85837007928746!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e66e2964e34e2d%3A0x8ddca9ee380ef7e0!2sEiffel%20Tower!5e0!3m2!1sen!2sfr!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Location map"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
