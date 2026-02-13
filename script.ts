import { prisma } from "./lib/prisma";

async function main() {
  console.log("--- Nettoyage de la base de données ---");
  // On supprime dans l'ordre inverse des relations pour éviter les erreurs de clés étrangères
  await prisma.image.deleteMany();
  await prisma.media.deleteMany();
  await prisma.news.deleteMany();
  await prisma.show.deleteMany();
  await prisma.user.deleteMany();

  console.log("--- Création de l'administrateur ---");
  const admin = await prisma.user.create({
    data: {
      name: "Admin Culturel",
      email: "admin@compagnie.fr",
      password: "hash_super_secure", // À hasher avec bcrypt en temps réel
      role: "ADMIN",
    },
  });

  console.log("--- Création des Actualités ---");
  for (let i = 1; i <= 3; i++) {
    await prisma.news.create({
      data: {
        title: `Actualité Culturelle n°${i}`,
        slug: `actualite-culturelle-${i}`,
        content: `Ceci est le contenu détaillé de notre actualité numéro ${i}. Un événement passionnant !`,
        authorId: admin.id,
        images: {
          create: [
            {
              url: `https://picsum.photos/seed/news${i}/800/600`,
              alt: "Image d'actu",
            },
          ],
        },
      },
    });
  }

  console.log("--- Création des Spectacles (Passé, Présent, Futur) ---");
  const dates = [
    {
      start: new Date("2023-10-01"),
      end: new Date("2023-10-05"),
      title: "Le Silence des Planches",
    }, // Passé
    {
      start: new Date("2026-02-01"),
      end: new Date("2026-03-01"),
      title: "Éclats d'Hiver",
    }, // Actuel (février 2026)
    {
      start: new Date("2026-07-15"),
      end: new Date("2026-07-20"),
      title: "Festival d'Été",
    }, // Futur
  ];

  for (const date of dates) {
    await prisma.show.create({
      data: {
        title: date.title,
        description: `Une performance unique de la compagnie pour le spectacle ${date.title}.`,
        location: "Théâtre National",
        startDate: date.start,
        endDate: date.end,
        images: {
          create: {
            url: `https://picsum.photos/seed/${date.title}/800/600`,
            alt: "Affiche du spectacle",
          },
        },
        medias: {
          create: {
            title: `Teaser - ${date.title}`,
            type: "VIDEO",
            url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          },
        },
      },
    });
  }

  console.log("--- Création de Médias indépendants ---");
  await prisma.media.createMany({
    data: [
      {
        title: "Interview du metteur en scène",
        type: "PODCAST",
        url: "https://spotify.com/...",
      },
      {
        title: "Dossier de presse 2026",
        type: "DOCUMENT",
        url: "https://pdf-archive.com/...",
      },
    ],
  });

  console.log("✅ Seed terminé avec succès !");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Erreur durant le seed :", e);
    await prisma.$disconnect();
    process.exit(1);
  });
