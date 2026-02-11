import { Users, Award, Theater, Sparkles } from 'lucide-react';

export function APropos() {
  const values = [
    {
      icon: Theater,
      title: 'Excellence Artistique',
      description: 'Nous nous engageons à présenter des spectacles de la plus haute qualité, alliant tradition et innovation.',
    },
    {
      icon: Users,
      title: 'Diversité',
      description: 'Notre programmation célèbre la richesse et la diversité des arts de la scène sous toutes leurs formes.',
    },
    {
      icon: Sparkles,
      title: 'Innovation',
      description: 'Nous repoussons constamment les limites de la création théâtrale contemporaine.',
    },
    {
      icon: Award,
      title: 'Engagement',
      description: 'Nous soutenons les jeunes talents et favorisons l\'accès à la culture pour tous.',
    },
  ];

  const teamMembers = [
    {
      name: 'Sophie Laurent',
      role: 'Directrice Artistique',
      image: 'https://images.unsplash.com/photo-1637761566180-9dbde4fdab77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcnRpc3RpYyUyMGRpcmVjdG9yJTIwcG9ydHJhaXQlMjBwcm9mZXNzaW9uYWx8ZW58MXx8fHwxNzcwMzE4MDY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Marc Dubois',
      role: 'Metteur en Scène',
      image: 'https://images.unsplash.com/photo-1764763180662-e4791157a87f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcmFtYXRpYyUyMHRoZWF0ZXIlMjBhY3RvciUyMHBvcnRyYWl0fGVufDF8fHx8MTc3MDMxNzkzNHww&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Élise Martin',
      role: 'Chorégraphe',
      image: 'https://images.unsplash.com/photo-1760543320338-7bde1336eaef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWxsZXQlMjBkYW5jZXJzJTIwc3RhZ2UlMjBwZXJmb3JtYW5jZXxlbnwxfHx8fDE3NzAzMTc4ODh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
    {
      name: 'Thomas Bernard',
      role: 'Directeur Technique',
      image: 'https://images.unsplash.com/photo-1715322608224-a9efaeeffaf7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxzdGFnZSUyMGxpZ2h0cyUyMHRoZWF0cmljYWwlMjBsaWdodGluZ3xlbnwxfHx8fDE3NzAzMTc5MzR8MA&ixlib=rb-4.1.0&q=80&w=1080',
    },
  ];

  const stats = [
    { number: '25+', label: 'Années d\'expérience' },
    { number: '150+', label: 'Spectacles créés' },
    { number: '50+', label: 'Artistes permanents' },
    { number: '100K+', label: 'Spectateurs par an' },
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Header Section */}
      <section className="py-20 bg-gradient-to-b from-[var(--deep-charcoal)] to-[var(--charcoal-light)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1
              className="text-5xl md:text-6xl mb-6"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              À Propos
            </h1>
            <p
              className="text-xl text-[var(--off-white)] max-w-3xl mx-auto leading-relaxed"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Découvrez l'histoire et les valeurs de la Compagnie Culturelle JDR, une référence
              dans le monde des arts de la scène.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-[var(--off-white)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2
                className="text-4xl mb-6"
                style={{ fontFamily: 'var(--font-serif)', color: 'var(--deep-charcoal)' }}
              >
                Notre Histoire
              </h2>
              <div className="space-y-4 text-[var(--charcoal-lighter)] leading-relaxed" style={{ fontFamily: 'var(--font-sans)' }}>
                <p>
                  Fondée en 2001, la Compagnie Culturelle JDR est née de la passion de plusieurs artistes
                  désireux de repousser les frontières des arts de la scène. Depuis plus de deux décennies,
                  nous avons construit une réputation d'excellence et d'innovation dans le paysage théâtral français.
                </p>
                <p>
                  Notre parcours a été marqué par des créations audacieuses qui ont touché des milliers de
                  spectateurs à travers la France. Nous avons eu l'honneur de présenter nos œuvres dans les
                  plus prestigieuses salles du pays et de collaborer avec des artistes de renommée internationale.
                </p>
                <p>
                  Aujourd'hui, la Compagnie Culturelle JDR continue d'évoluer, fidèle à sa mission originelle :
                  créer des expériences théâtrales inoubliables qui captivent, émeuvent et inspirent. Nous
                  restons engagés à soutenir la création contemporaine tout en rendant hommage aux grands
                  classiques du répertoire.
                </p>
              </div>
            </div>
            <div className="relative h-[500px] rounded-lg overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1577537653888-383504d823ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0aGVhdGVyJTIwY29tcGFueSUyMHRlYWmJTIwZ3JvdXB8ZW58MXx8fHwxNzcwMzE4MDY1fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="Notre équipe"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-[var(--deep-charcoal)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div
                  className="text-4xl md:text-5xl mb-2"
                  style={{ fontFamily: 'var(--font-serif)', color: 'var(--yellow-primary)' }}
                >
                  {stat.number}
                </div>
                <div
                  className="text-[var(--off-white)]"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-4xl mb-4"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--deep-charcoal)' }}
            >
              Nos Valeurs
            </h2>
            <div className="w-24 h-1 bg-[var(--blue-primary)] mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              const colorScheme = index % 2 === 0
                ? { bg: 'var(--yellow-primary)', icon: 'var(--yellow-primary)' }
                : { bg: 'var(--blue-primary)', icon: 'var(--blue-primary)' }; // Using blue-primary as substitute for undefined accent-blue

              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-lg bg-[var(--off-white)] hover:shadow-lg transition-shadow duration-300"
                >
                  <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
                    style={{ backgroundColor: `${colorScheme.bg}15` }}
                  >
                    <Icon className="w-8 h-8" style={{ color: colorScheme.icon }} />
                  </div>
                  <h3
                    className="text-xl mb-3"
                    style={{ fontFamily: 'var(--font-serif)', color: 'var(--deep-charcoal)' }}
                  >
                    {value.title}
                  </h3>
                  <p
                    className="text-[var(--charcoal-lighter)] leading-relaxed"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-[var(--off-white)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2
              className="text-4xl mb-4"
              style={{ fontFamily: 'var(--font-serif)', color: 'var(--deep-charcoal)' }}
            >
              Notre Équipe
            </h2>
            <div className="w-24 h-1 bg-[var(--blue-primary)] mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className="relative h-80 overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3
                      className="text-xl mb-1"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      {member.name}
                    </h3>
                    <p
                      className="text-[var(--blue-primary)]"
                      style={{ fontFamily: 'var(--font-sans)', fontWeight: 500 }}
                    >
                      {member.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-[var(--deep-charcoal)] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className="text-4xl mb-6"
            style={{ fontFamily: 'var(--font-serif)' }}
          >
            Notre Mission
          </h2>
          <p
            className="text-xl text-[var(--off-white)] leading-relaxed mb-8"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            "Créer des expériences théâtrales qui transcendent les frontières, touchent les cœurs
            et inspirent les esprits. Nous croyons au pouvoir transformateur des arts de la scène
            pour rassembler les communautés et enrichir la vie culturelle."
          </p>
          <div className="w-32 h-1 bg-[var(--yellow-primary)] mx-auto" />
        </div>
      </section>
    </div>
  );
}
