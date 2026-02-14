import "dotenv/config";
import cors from "cors";
import crypto from "node:crypto";
import express from "express";
import { prisma } from "../lib/prisma";

const app = express();
const PORT = Number(process.env.PORT) || 4000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json({ limit: "2mb" }));

type AdminTokenPayload = {
  exp: number;
};

const createAdminToken = (secret: string): string => {
  const exp = Date.now() + 8 * 60 * 60 * 1000;
  const payload = String(exp);
  const sig = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return Buffer.from(`${payload}.${sig}`, "utf8").toString("base64url");
};

const verifyAdminToken = (token: string, secret: string): AdminTokenPayload | null => {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [expRaw, sigRaw] = decoded.split(".");
    if (!expRaw || !sigRaw) return null;

    const expectedSig = crypto.createHmac("sha256", secret).update(expRaw).digest("hex");
    const isValidSig = crypto.timingSafeEqual(Buffer.from(sigRaw), Buffer.from(expectedSig));
    if (!isValidSig) return null;

    const exp = Number(expRaw);
    if (!Number.isFinite(exp) || exp < Date.now()) return null;

    return { exp };
  } catch {
    return null;
  }
};

const getBearerToken = (authHeader?: string): string | null => {
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return null;
  return token;
};

const requireAdmin: express.RequestHandler = (req, res, next) => {
  const secret = process.env.ADMIN_JWT_SECRET || "";
  if (!secret) {
    res.status(500).json({ error: "Server misconfigured." });
    return;
  }

  const token = getBearerToken(req.header("authorization"));
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const payload = verifyAdminToken(token, secret);
  if (!payload) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
};

const slugify = (input: string): string =>
  input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

const ensureUniqueSlug = async (title: string): Promise<string> => {
  const base = slugify(title) || "actualite";
  let candidate = base;
  let i = 1;

  // Keep probing until slug is free.
  for (;;) {
    const existing = await prisma.news.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing) return candidate;
    i += 1;
    candidate = `${base}-${i}`;
  }
};

const formatNews = (item: {
  id: string;
  title: string;
  slug: string;
  content: string;
  publishedAt: Date;
  images: { url: string; alt: string | null }[];
}) => {
  const excerpt = item.content.length > 180 ? `${item.content.slice(0, 180).trim()}...` : item.content;
  return {
    ...item,
    excerpt,
    date: item.publishedAt.toISOString().slice(0, 10),
    image: item.images[0]?.url ?? null,
  };
};

const formatShow = (item: {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: Date;
  endDate: Date;
  images: { url: string; alt: string | null }[];
}) => ({
  ...item,
  subtitle: "",
  status: item.endDate >= new Date() ? "upcoming" : "past",
  date: `${item.startDate.toISOString().slice(0, 10)} -> ${item.endDate.toISOString().slice(0, 10)}`,
  duration: "",
  capacity: "",
  image: item.images[0]?.url ?? null,
});

const getAdminUserId = async (): Promise<string> => {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@compagnie.fr";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail }, select: { id: true } });
  if (existing) return existing.id;

  const created = await prisma.user.create({
    data: {
      email: adminEmail,
      name: "Admin",
      password: "placeholder",
      role: "ADMIN",
    },
    select: { id: true },
  });

  return created.id;
};

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/admin/login", (req, res) => {
  const username = req.body?.username ? String(req.body.username).trim() : "";
  const password = req.body?.password ? String(req.body.password).trim() : "";

  const expectedUser = process.env.ADMIN_USER || "";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  const secret = process.env.ADMIN_JWT_SECRET || "";

  if (!expectedUser || !expectedPassword || !secret) {
    res.status(500).json({ error: "Server misconfigured." });
    return;
  }

  if (username !== expectedUser || password !== expectedPassword) {
    res.status(401).json({ error: "Invalid credentials." });
    return;
  }

  const token = createAdminToken(secret);
  res.json({ ok: true, token });
});

app.get("/api/admin/me", requireAdmin, (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/admin/logout", requireAdmin, (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/news", async (req, res) => {
  try {
    const limitRaw = Number(req.query.limit);
    const take = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 20) : undefined;

    const news = await prisma.news.findMany({
      ...(take ? { take } : {}),
      orderBy: { publishedAt: "desc" },
      include: { images: { select: { url: true, alt: true } } },
    });

    res.json(news.map(formatNews));
  } catch (error) {
    console.error("[server] GET /api/news failed", error);
    res.status(500).json({ error: "Erreur lors de la recuperation des news" });
  }
});

app.get("/api/news/:id", async (req, res) => {
  try {
    const article = await prisma.news.findUnique({
      where: { id: String(req.params.id) },
      include: { images: { select: { url: true, alt: true } } },
    });

    if (!article) {
      res.status(404).json({ error: "Article non trouve" });
      return;
    }

    res.json(formatNews(article));
  } catch (error) {
    console.error("[server] GET /api/news/:id failed", error);
    res.status(500).json({ error: "Erreur lors de la recuperation de l'article" });
  }
});

app.post("/api/news", requireAdmin, async (req, res) => {
  try {
    const title = req.body?.title ? String(req.body.title).trim() : "";
    const content = req.body?.content ? String(req.body.content).trim() : "";
    const imageUrl = req.body?.imageUrl ? String(req.body.imageUrl).trim() : "";
    const publishedAtRaw = req.body?.publishedAt ? String(req.body.publishedAt).trim() : "";

    if (!title || !content) {
      res.status(400).json({ error: "Missing required fields." });
      return;
    }

    const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : new Date();
    if (Number.isNaN(publishedAt.getTime())) {
      res.status(400).json({ error: "Invalid publishedAt value." });
      return;
    }

    const slug = await ensureUniqueSlug(title);
    const authorId = await getAdminUserId();

    const created = await prisma.news.create({
      data: {
        title,
        slug,
        content,
        publishedAt,
        authorId,
        ...(imageUrl ? { images: { create: [{ url: imageUrl, alt: title }] } } : {}),
      },
      include: { images: { select: { url: true, alt: true } } },
    });

    res.status(201).json(formatNews(created));
  } catch (error) {
    console.error("[server] POST /api/news failed", error);
    res.status(500).json({ error: "Erreur lors de la creation de l'actualite" });
  }
});

app.put("/api/news/:id", requireAdmin, async (req, res) => {
  try {
    const title = req.body?.title ? String(req.body.title).trim() : "";
    const content = req.body?.content ? String(req.body.content).trim() : "";
    const imageUrl = req.body?.imageUrl ? String(req.body.imageUrl).trim() : "";
    const publishedAtRaw = req.body?.publishedAt ? String(req.body.publishedAt).trim() : "";

    if (!title || !content) {
      res.status(400).json({ error: "Missing required fields." });
      return;
    }

    const existing = await prisma.news.findUnique({ where: { id: String(req.params.id) }, include: { images: true } });
    if (!existing) {
      res.status(404).json({ error: "News not found." });
      return;
    }

    const publishedAt = publishedAtRaw ? new Date(publishedAtRaw) : existing.publishedAt;
    if (Number.isNaN(publishedAt.getTime())) {
      res.status(400).json({ error: "Invalid publishedAt value." });
      return;
    }

    if (existing.title !== title) {
      const nextSlug = await ensureUniqueSlug(title);
      await prisma.news.update({ where: { id: existing.id }, data: { slug: nextSlug } });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.image.deleteMany({ where: { newsId: existing.id } });

      return tx.news.update({
        where: { id: existing.id },
        data: {
          title,
          content,
          publishedAt,
          ...(imageUrl ? { images: { create: [{ url: imageUrl, alt: title }] } } : {}),
        },
        include: { images: { select: { url: true, alt: true } } },
      });
    });

    res.json(formatNews(updated));
  } catch (error) {
    console.error("[server] PUT /api/news failed", error);
    res.status(500).json({ error: "Erreur lors de la mise a jour de l'actualite" });
  }
});

app.delete("/api/news/:id", requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.news.findUnique({ where: { id: String(req.params.id) }, select: { id: true } });
    if (!existing) {
      res.status(404).json({ error: "News not found." });
      return;
    }

    await prisma.news.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  } catch (error) {
    console.error("[server] DELETE /api/news failed", error);
    res.status(500).json({ error: "Erreur lors de la suppression de l'actualite" });
  }
});

app.get("/api/shows", async (_req, res) => {
  try {
    const shows = await prisma.show.findMany({
      include: { images: { select: { url: true, alt: true } } },
      orderBy: { startDate: "asc" },
    });

    res.json(shows.map(formatShow));
  } catch (error) {
    console.error("[server] GET /api/shows failed", error);
    res.status(500).json({ error: "Erreur lors de la recuperation des spectacles" });
  }
});

app.post("/api/shows", requireAdmin, async (req, res) => {
  try {
    const title = req.body?.title ? String(req.body.title).trim() : "";
    const location = req.body?.location ? String(req.body.location).trim() : "";
    const description = req.body?.description ? String(req.body.description).trim() : "";
    const startDateRaw = req.body?.startDate ? String(req.body.startDate).trim() : "";
    const endDateRaw = req.body?.endDate ? String(req.body.endDate).trim() : "";

    if (!title || !location || !description || !startDateRaw || !endDateRaw) {
      res.status(400).json({ error: "Missing required fields." });
      return;
    }

    const startDate = new Date(startDateRaw);
    const endDate = new Date(endDateRaw);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
      res.status(400).json({ error: "Invalid dates." });
      return;
    }

    const created = await prisma.show.create({
      data: { title, location, description, startDate, endDate },
      include: { images: { select: { url: true, alt: true } } },
    });

    res.status(201).json(formatShow(created));
  } catch (error) {
    console.error("[server] POST /api/shows failed", error);
    res.status(500).json({ error: "Erreur lors de la creation du spectacle" });
  }
});

app.put("/api/shows/:id", requireAdmin, async (req, res) => {
  try {
    const title = req.body?.title ? String(req.body.title).trim() : "";
    const location = req.body?.location ? String(req.body.location).trim() : "";
    const description = req.body?.description ? String(req.body.description).trim() : "";
    const startDateRaw = req.body?.startDate ? String(req.body.startDate).trim() : "";
    const endDateRaw = req.body?.endDate ? String(req.body.endDate).trim() : "";

    if (!title || !location || !description || !startDateRaw || !endDateRaw) {
      res.status(400).json({ error: "Missing required fields." });
      return;
    }

    const startDate = new Date(startDateRaw);
    const endDate = new Date(endDateRaw);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
      res.status(400).json({ error: "Invalid dates." });
      return;
    }

    const existing = await prisma.show.findUnique({ where: { id: String(req.params.id) }, select: { id: true } });
    if (!existing) {
      res.status(404).json({ error: "Show not found." });
      return;
    }

    const updated = await prisma.show.update({
      where: { id: existing.id },
      data: { title, location, description, startDate, endDate },
      include: { images: { select: { url: true, alt: true } } },
    });

    res.json(formatShow(updated));
  } catch (error) {
    console.error("[server] PUT /api/shows failed", error);
    res.status(500).json({ error: "Erreur lors de la mise a jour du spectacle" });
  }
});

app.delete("/api/shows/:id", requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.show.findUnique({ where: { id: String(req.params.id) }, select: { id: true } });
    if (!existing) {
      res.status(404).json({ error: "Show not found." });
      return;
    }

    await prisma.show.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  } catch (error) {
    console.error("[server] DELETE /api/shows failed", error);
    res.status(500).json({ error: "Erreur lors de la suppression du spectacle" });
  }
});

app.get("/api/media/photos", async (_req, res) => {
  try {
    const photos = await prisma.image.findMany({
      where: { newsId: null, showId: null, mediaId: null },
      orderBy: { createdAt: "desc" },
      select: { id: true, url: true, alt: true },
    });

    res.json(photos.map((photo) => ({ id: photo.id, url: photo.url, title: photo.alt })));
  } catch (error) {
    console.error("[server] GET /api/media/photos failed", error);
    res.status(500).json({ error: "Erreur lors de la recuperation des photos" });
  }
});

app.post("/api/media/photos", requireAdmin, async (req, res) => {
  try {
    const url = req.body?.url ? String(req.body.url).trim() : "";
    const title = req.body?.title ? String(req.body.title).trim() : null;

    if (!url) {
      res.status(400).json({ error: "Photo URL is required." });
      return;
    }

    const created = await prisma.image.create({
      data: { url, alt: title },
      select: { id: true, url: true, alt: true },
    });

    res.status(201).json({ id: created.id, url: created.url, title: created.alt });
  } catch (error) {
    console.error("[server] POST /api/media/photos failed", error);
    res.status(500).json({ error: "Erreur lors de l'ajout de la photo" });
  }
});

app.delete("/api/media/photos/:id", requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.image.findUnique({ where: { id: String(req.params.id) }, select: { id: true } });
    if (!existing) {
      res.status(404).json({ error: "Photo not found." });
      return;
    }

    await prisma.image.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  } catch (error) {
    console.error("[server] DELETE /api/media/photos failed", error);
    res.status(500).json({ error: "Erreur lors de la suppression de la photo" });
  }
});

app.post("/api/contact", async (req, res) => {
  try {
    const name = req.body?.name ? String(req.body.name).trim() : "";
    const email = req.body?.email ? String(req.body.email).trim() : "";
    const message = req.body?.message ? String(req.body.message).trim() : "";

    if (!name || !email || !message) {
      res.status(400).json({ error: "Missing required fields." });
      return;
    }

    const created = await prisma.contactMessage.create({
      data: { name, email, message },
      select: { id: true, name: true, email: true, message: true, createdAt: true },
    });

    res.status(201).json(created);
  } catch (error) {
    console.error("[server] POST /api/contact failed", error);
    res.status(500).json({ error: "Erreur lors de l'envoi du message" });
  }
});

app.get("/api/contact/messages", requireAdmin, async (_req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, email: true, message: true, createdAt: true },
    });

    res.json(messages.map((item) => ({ ...item, created_at: item.createdAt })));
  } catch (error) {
    console.error("[server] GET /api/contact/messages failed", error);
    res.status(500).json({ error: "Erreur lors de la recuperation des messages" });
  }
});

app.delete("/api/contact/messages/:id", requireAdmin, async (req, res) => {
  try {
    const existing = await prisma.contactMessage.findUnique({ where: { id: String(req.params.id) }, select: { id: true } });
    if (!existing) {
      res.status(404).json({ error: "Message not found." });
      return;
    }

    await prisma.contactMessage.delete({ where: { id: existing.id } });
    res.json({ ok: true });
  } catch (error) {
    console.error("[server] DELETE /api/contact/messages failed", error);
    res.status(500).json({ error: "Erreur lors de la suppression du message" });
  }
});

app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}`);
});

