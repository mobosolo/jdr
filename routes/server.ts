import express from "express";
import cors from "cors";
import { prisma } from "../lib/prisma";

const app = express();
app.use(cors());
app.use(express.json());

// --- ROUTES NEWS ---
app.get("/api/news", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const news = await prisma.news.findMany({
      take: limit,
      orderBy: { publishedAt: "desc" },
      include: { images: { select: { url: true, alt: true } } },
    });
    res.json(news);
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de la récupération des news" });
  }
});

// Route pour un article unique
app.get("/api/news/:id", async (req, res) => {
  try {
    const { id } = req.params; // On récupère l'ID envoyé dans l'URL

    const article = await prisma.news.findUnique({
      where: { id: id },
      include: {
        images: {
          select: { url: true, alt: true },
        },
      },
    });

    if (!article) {
      return res.status(404).json({ error: "Article non trouvé" });
    }

    res.json(article);
  } catch (error) {
    console.error("Erreur serveur:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération de l'article" });
  }
});

// --- ROUTES SPECTACLES ---
app.get("/api/shows", async (req, res) => {
  try {
    const shows = await prisma.show.findMany({
      include: { images: { select: { url: true, alt: true } } },
      orderBy: { startDate: "asc" },
    });
    res.json(shows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des spectacles" });
  }
});

// --- ROUTES MEDIAS (Photos & Galeries) ---

/**
 * Cette route récupère toutes les images qui ne sont pas liées à une news spécifique
 * ou simplement toutes les images enregistrées pour la galerie globale.
 */
app.get("/api/media/photos", async (_req, res) => {
  try {
    const photos = await prisma.image.findMany({
      orderBy: { createdAt: "desc" },
      // On peut filtrer ici si tu veux exclure les images de News par exemple :
      // where: { newsId: null }
    });

    // On reformate légèrement pour que le front-end reçoive 'title' (via l'alt)
    const formattedPhotos = photos.map((p) => ({
      id: p.id,
      url: p.url,
      title: p.alt,
    }));

    res.json(formattedPhotos);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des photos" });
  }
});

/**
 * Route pour les vidéos / podcasts (Modèle Media)
 */
app.get("/api/media/videos", async (_req, res) => {
  try {
    const videos = await prisma.media.findMany({
      where: { type: "VIDEO" },
      include: { images: { select: { url: true } } },
      orderBy: { id: "desc" },
    });
    res.json(videos);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Erreur lors de la récupération des vidéos" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`🚀 Server ready at http://localhost:${PORT}`),
);
