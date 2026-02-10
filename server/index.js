import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import csurf from 'csurf';
import { pool } from './db.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 4000;
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const isProduction = process.env.NODE_ENV === 'production';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads are allowed.'));
    }
    cb(null, true);
  },
});

app.use(helmet());
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
  },
});

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const uploadImageToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Cloudinary upload failed.'));
          return;
        }
        resolve(result);
      }
    );
    stream.end(buffer);
  });

const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (error) {
    console.warn('[server] Failed to delete Cloudinary image', error);
  }
};

const ADMIN_TOKEN_COOKIE = 'admin_token';

const verifyAdminCredentials = (username, password) => {
  const expectedUser = process.env.ADMIN_USER || '';
  const expectedPass = process.env.ADMIN_PASSWORD || '';
  if (!expectedUser || !expectedPass) {
    return false;
  }
  if (username.length !== expectedUser.length || password.length !== expectedPass.length) {
    return false;
  }
  const userMatch = crypto.timingSafeEqual(Buffer.from(username), Buffer.from(expectedUser));
  const passMatch = crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expectedPass));
  return userMatch && passMatch;
};

const requireAdmin = (req, res, next) => {
  const token = req.cookies?.[ADMIN_TOKEN_COOKIE];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const secret = process.env.ADMIN_JWT_SECRET || '';
    const payload = jwt.verify(token, secret);
    if (!payload || payload.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

const validateShowPayload = (payload) => {
  const {
    title,
    subtitle,
    status,
    date,
    location,
    duration,
    capacity,
    description,
  } = payload ?? {};

  const errors = [];
  if (!title || !String(title).trim()) errors.push('title');
  if (!subtitle || !String(subtitle).trim()) errors.push('subtitle');
  if (!date || !String(date).trim()) errors.push('date');
  if (!location || !String(location).trim()) errors.push('location');
  if (!duration || !String(duration).trim()) errors.push('duration');
  if (!capacity || !String(capacity).trim()) errors.push('capacity');
  if (!description || !String(description).trim()) errors.push('description');
  if (!['upcoming', 'past'].includes(status)) errors.push('status');
  if (String(title ?? '').length > 150) errors.push('title');
  if (String(subtitle ?? '').length > 150) errors.push('subtitle');
  if (String(date ?? '').length > 100) errors.push('date');
  if (String(location ?? '').length > 200) errors.push('location');
  if (String(duration ?? '').length > 50) errors.push('duration');
  if (String(capacity ?? '').length > 50) errors.push('capacity');
  if (String(description ?? '').length > 2000) errors.push('description');

  return { errors, cleaned: {
    title: String(title ?? '').trim(),
    subtitle: String(subtitle ?? '').trim(),
    status,
    date: String(date ?? '').trim(),
    location: String(location ?? '').trim(),
    duration: String(duration ?? '').trim(),
    capacity: String(capacity ?? '').trim(),
    description: String(description ?? '').trim(),
  }};
};

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/admin/csrf', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.post('/api/admin/login', adminLoginLimiter, csrfProtection, (req, res) => {
  const username = req.body?.username ? String(req.body.username).trim() : '';
  const password = req.body?.password ? String(req.body.password).trim() : '';
  const secret = process.env.ADMIN_JWT_SECRET || '';

  if (!secret) {
    return res.status(500).json({ error: 'Server misconfigured.' });
  }

  if (!verifyAdminCredentials(username, password)) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = jwt.sign({ role: 'admin' }, secret, { expiresIn: '8h' });
  res.cookie(ADMIN_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: 8 * 60 * 60 * 1000,
  });

  res.json({ ok: true });
});

app.post('/api/admin/logout', csrfProtection, (_req, res) => {
  res.clearCookie(ADMIN_TOKEN_COOKIE, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
  });
  res.json({ ok: true });
});

app.get('/api/admin/me', (req, res) => {
  const token = req.cookies?.[ADMIN_TOKEN_COOKIE];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const secret = process.env.ADMIN_JWT_SECRET || '';
    const payload = jwt.verify(token, secret);
    if (!payload || payload.role !== 'admin') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    return res.json({ ok: true });
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
});

app.get('/api/shows', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, title, subtitle, image, status, date_text AS date, location, duration, capacity, description
       FROM shows
       ORDER BY created_at DESC, id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('[server] GET /api/shows failed', error);
    res.status(500).json({ error: 'Failed to load shows.' });
  }
});

app.get('/api/media/photos', async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, url, title
       FROM media_photos
       ORDER BY created_at DESC, id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('[server] GET /api/media/photos failed', error);
    res.status(500).json({ error: 'Failed to load media photos.' });
  }
});

app.post('/api/media/photos', requireAdmin, csrfProtection, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image is required.' });
    }

    const title = req.body?.title ? String(req.body.title).trim() : null;

    const result = await uploadImageToCloudinary(req.file.buffer, 'jdr/media');
    const imageUrl = result.secure_url;
    const publicId = result.public_id;

    const { rows } = await pool.query(
      `INSERT INTO media_photos (url, public_id, title)
       VALUES ($1, $2, $3)
       RETURNING id, url, title`,
      [imageUrl, publicId, title]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('[server] POST /api/media/photos failed', error);
    res.status(500).json({ error: 'Failed to upload media photo.' });
  }
});

app.delete('/api/media/photos/:id', requireAdmin, csrfProtection, async (req, res) => {
  try {
    const photoId = Number(req.params.id);
    if (!Number.isFinite(photoId)) {
      return res.status(400).json({ error: 'Invalid photo id.' });
    }

    const existing = await pool.query(
      'SELECT public_id FROM media_photos WHERE id = $1',
      [photoId]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'Photo not found.' });
    }

    await pool.query('DELETE FROM media_photos WHERE id = $1', [photoId]);

    const publicId = existing.rows[0].public_id;
    if (publicId) {
      await deleteCloudinaryImage(publicId);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('[server] DELETE /api/media/photos failed', error);
    res.status(500).json({ error: 'Failed to delete media photo.' });
  }
});

app.post('/api/shows', requireAdmin, csrfProtection, async (req, res) => {
  try {
    const { errors, cleaned } = validateShowPayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Missing or invalid fields.', fields: errors });
    }

    let imageUrl = null;
    const randomImage = await pool.query(
      'SELECT url FROM show_images ORDER BY RANDOM() LIMIT 1'
    );
    if (randomImage.rowCount > 0) {
      imageUrl = randomImage.rows[0].url;
    }

    const { rows } = await pool.query(
      `INSERT INTO shows (title, subtitle, image, status, date_text, location, duration, capacity, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING id, title, subtitle, image, status, date_text AS date, location, duration, capacity, description`,
      [
        cleaned.title,
        cleaned.subtitle,
        imageUrl,
        cleaned.status,
        cleaned.date,
        cleaned.location,
        cleaned.duration,
        cleaned.capacity,
        cleaned.description,
      ]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('[server] POST /api/shows failed', error);
    res.status(500).json({ error: 'Failed to create show.' });
  }
});

app.get('/api/news', async (req, res) => {
  try {
    const limit = req.query?.limit ? Number(req.query.limit) : null;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 20) : null;
    const baseQuery =
      `SELECT id, title, excerpt, content, image, date_text AS date
       FROM news
       ORDER BY created_at DESC, id DESC`;
    const query = safeLimit ? `${baseQuery} LIMIT ${safeLimit}` : baseQuery;
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('[server] GET /api/news failed', error);
    res.status(500).json({ error: 'Failed to load news.' });
  }
});

app.get('/api/news/:id', async (req, res) => {
  try {
    const newsId = Number(req.params.id);
    if (!Number.isFinite(newsId)) {
      return res.status(400).json({ error: 'Invalid news id.' });
    }

    const { rows } = await pool.query(
      `SELECT id, title, excerpt, content, image, date_text AS date
       FROM news
       WHERE id = $1`,
      [newsId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'News not found.' });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('[server] GET /api/news/:id failed', error);
    res.status(500).json({ error: 'Failed to load news item.' });
  }
});

app.post('/api/news', requireAdmin, csrfProtection, upload.single('image'), async (req, res) => {
  try {
    const title = req.body?.title ? String(req.body.title).trim() : '';
    const excerpt = req.body?.excerpt ? String(req.body.excerpt).trim() : '';
    const content = req.body?.content ? String(req.body.content).trim() : null;
    const date = req.body?.date ? String(req.body.date).trim() : '';

    const errors = [];
    if (!title) errors.push('title');
    if (!excerpt) errors.push('excerpt');
    if (!date) errors.push('date');
    if (title.length > 150) errors.push('title');
    if (excerpt.length > 400) errors.push('excerpt');
    if (date.length > 100) errors.push('date');
    if (content && content.length > 5000) errors.push('content');

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Missing or invalid fields.', fields: errors });
    }

    let imageUrl = null;
    let imagePublicId = null;

    if (req.file) {
      const result = await uploadImageToCloudinary(req.file.buffer, 'jdr/news');
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    const { rows } = await pool.query(
      `INSERT INTO news (title, excerpt, content, image, image_public_id, date_text)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, excerpt, content, image, date_text AS date`,
      [title, excerpt, content, imageUrl, imagePublicId, date]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('[server] POST /api/news failed', error);
    res.status(500).json({ error: 'Failed to create news.' });
  }
});

app.put('/api/news/:id', requireAdmin, csrfProtection, upload.single('image'), async (req, res) => {
  try {
    const newsId = Number(req.params.id);
    if (!Number.isFinite(newsId)) {
      return res.status(400).json({ error: 'Invalid news id.' });
    }

    const title = req.body?.title ? String(req.body.title).trim() : '';
    const excerpt = req.body?.excerpt ? String(req.body.excerpt).trim() : '';
    const content = req.body?.content ? String(req.body.content).trim() : null;
    const date = req.body?.date ? String(req.body.date).trim() : '';
    const removeImage = String(req.body?.removeImage ?? 'false') === 'true';

    const errors = [];
    if (!title) errors.push('title');
    if (!excerpt) errors.push('excerpt');
    if (!date) errors.push('date');
    if (title.length > 150) errors.push('title');
    if (excerpt.length > 400) errors.push('excerpt');
    if (date.length > 100) errors.push('date');
    if (content && content.length > 5000) errors.push('content');

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Missing or invalid fields.', fields: errors });
    }

    const existing = await pool.query(
      'SELECT image, image_public_id FROM news WHERE id = $1',
      [newsId]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'News not found.' });
    }

    let imageUrl = existing.rows[0].image;
    let imagePublicId = existing.rows[0].image_public_id;
    let oldPublicIdToDelete = null;

    if (removeImage) {
      oldPublicIdToDelete = imagePublicId;
      imageUrl = null;
      imagePublicId = null;
    }

    if (req.file) {
      const result = await uploadImageToCloudinary(req.file.buffer, 'jdr/news');
      oldPublicIdToDelete = imagePublicId;
      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    const { rows } = await pool.query(
      `UPDATE news
       SET title = $1,
           excerpt = $2,
           content = $3,
           image = $4,
           image_public_id = $5,
           date_text = $6
       WHERE id = $7
       RETURNING id, title, excerpt, content, image, date_text AS date`,
      [title, excerpt, content, imageUrl, imagePublicId, date, newsId]
    );

    if (oldPublicIdToDelete) {
      await deleteCloudinaryImage(oldPublicIdToDelete);
    }

    res.json(rows[0]);
  } catch (error) {
    console.error('[server] PUT /api/news failed', error);
    res.status(500).json({ error: 'Failed to update news.' });
  }
});

app.delete('/api/news/:id', requireAdmin, csrfProtection, async (req, res) => {
  try {
    const newsId = Number(req.params.id);
    if (!Number.isFinite(newsId)) {
      return res.status(400).json({ error: 'Invalid news id.' });
    }

    const existing = await pool.query(
      'SELECT image_public_id FROM news WHERE id = $1',
      [newsId]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'News not found.' });
    }

    await pool.query('DELETE FROM news WHERE id = $1', [newsId]);

    const publicId = existing.rows[0].image_public_id;
    if (publicId) {
      await deleteCloudinaryImage(publicId);
    }

    res.json({ ok: true });
  } catch (error) {
    console.error('[server] DELETE /api/news failed', error);
    res.status(500).json({ error: 'Failed to delete news.' });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const name = req.body?.name ? String(req.body.name).trim() : '';
    const email = req.body?.email ? String(req.body.email).trim() : '';
    const message = req.body?.message ? String(req.body.message).trim() : '';

    const errors = [];
    if (!name) errors.push('name');
    if (!email) errors.push('email');
    if (!message) errors.push('message');
    if (name.length > 100) errors.push('name');
    if (email.length > 200) errors.push('email');
    if (message.length > 2000) errors.push('message');

    if (errors.length > 0) {
      return res.status(400).json({ error: 'Missing or invalid fields.', fields: errors });
    }

    const { rows } = await pool.query(
      `INSERT INTO contact_messages (name, email, message)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, message, created_at`,
      [name, email, message]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('[server] POST /api/contact failed', error);
    res.status(500).json({ error: 'Failed to submit message.' });
  }
});

app.get('/api/contact/messages', requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, message, created_at
       FROM contact_messages
       ORDER BY created_at DESC, id DESC`
    );
    res.json(rows);
  } catch (error) {
    console.error('[server] GET /api/contact/messages failed', error);
    res.status(500).json({ error: 'Failed to load messages.' });
  }
});

app.delete('/api/contact/messages/:id', requireAdmin, csrfProtection, async (req, res) => {
  try {
    const messageId = Number(req.params.id);
    if (!Number.isFinite(messageId)) {
      return res.status(400).json({ error: 'Invalid message id.' });
    }

    const existing = await pool.query(
      'SELECT id FROM contact_messages WHERE id = $1',
      [messageId]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'Message not found.' });
    }

    await pool.query('DELETE FROM contact_messages WHERE id = $1', [messageId]);
    res.json({ ok: true });
  } catch (error) {
    console.error('[server] DELETE /api/contact/messages failed', error);
    res.status(500).json({ error: 'Failed to delete message.' });
  }
});

app.put('/api/shows/:id', requireAdmin, csrfProtection, async (req, res) => {
  try {
    const showId = Number(req.params.id);
    if (!Number.isFinite(showId)) {
      return res.status(400).json({ error: 'Invalid show id.' });
    }

    const { errors, cleaned } = validateShowPayload(req.body);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Missing or invalid fields.', fields: errors });
    }

    const existing = await pool.query(
      'SELECT image FROM shows WHERE id = $1',
      [showId]
    );

    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'Show not found.' });
    }

    const imageUrl = existing.rows[0].image;

    const { rows } = await pool.query(
      `UPDATE shows
       SET title = $1,
           subtitle = $2,
           image = $3,
           status = $4,
           date_text = $5,
           location = $6,
           duration = $7,
           capacity = $8,
           description = $9
       WHERE id = $10
       RETURNING id, title, subtitle, image, status, date_text AS date, location, duration, capacity, description`,
      [
        cleaned.title,
        cleaned.subtitle,
        imageUrl,
        cleaned.status,
        cleaned.date,
        cleaned.location,
        cleaned.duration,
        cleaned.capacity,
        cleaned.description,
        showId,
      ]
    );

    res.json(rows[0]);
  } catch (error) {
    console.error('[server] PUT /api/shows failed', error);
    res.status(500).json({ error: 'Failed to update show.' });
  }
});

app.delete('/api/shows/:id', requireAdmin, csrfProtection, async (req, res) => {
  try {
    const showId = Number(req.params.id);
    if (!Number.isFinite(showId)) {
      return res.status(400).json({ error: 'Invalid show id.' });
    }

    const existing = await pool.query('SELECT id FROM shows WHERE id = $1', [showId]);

    if (existing.rowCount === 0) {
      return res.status(404).json({ error: 'Show not found.' });
    }

    await pool.query('DELETE FROM shows WHERE id = $1', [showId]);

    res.json({ ok: true });
  } catch (error) {
    console.error('[server] DELETE /api/shows failed', error);
    res.status(500).json({ error: 'Failed to delete show.' });
  }
});

app.listen(port, () => {
  console.log(`[server] listening on http://localhost:${port}`);
});
