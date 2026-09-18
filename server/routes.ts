import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { db, hashPassword, verifyPassword, initDatabase } from './db.js';

export const router = Router();

// Session duration: 7 days
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

// Auth middleware for protected routes
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.substring(7);
  const session = db.prepare(`
    SELECT * FROM sessions WHERE token = ? AND expires_at > CURRENT_TIMESTAMP
  `).get(token) as { token: string; username: string; expires_at: string } | undefined;

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid' });
  }

  (req as any).user = { username: session.username };
  next();
}

// ---------------- AUTH ENDPOINTS ----------------

// POST /api/auth/login
router.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  const user = db.prepare('SELECT * FROM admin_user WHERE username = ?').get(username) as {
    username: string;
    password_hash: string;
    salt: string;
  } | undefined;

  if (!user || !verifyPassword(password, user.salt, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS).toISOString();

  db.prepare(`
    INSERT INTO sessions (token, username, expires_at) VALUES (?, ?, ?)
  `).run(token, user.username, expiresAt);

  return res.json({ token, username: user.username, expiresAt });
});

// GET /api/auth/me (verify current token)
router.get('/auth/me', requireAuth, (req, res) => {
  return res.json({ user: (req as any).user });
});

// POST /api/auth/logout
router.post('/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  }
  return res.json({ success: true });
});

// POST /api/auth/change-password
router.post('/auth/change-password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current and new password required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  const username = (req as any).user.username;
  const user = db.prepare('SELECT * FROM admin_user WHERE username = ?').get(username) as {
    password_hash: string;
    salt: string;
  };

  if (!verifyPassword(currentPassword, user.salt, user.password_hash)) {
    return res.status(401).json({ error: 'Current password is incorrect' });
  }

  const { salt, hash } = hashPassword(newPassword);
  db.prepare(`
    UPDATE admin_user SET password_hash = ?, salt = ?, updated_at = CURRENT_TIMESTAMP WHERE username = ?
  `).run(hash, salt, username);

  return res.json({ success: true, message: 'Password updated successfully' });
});

// ---------------- PUBLIC GET DATA ENDPOINT (FETCH ALL APP DATA) ----------------

router.get('/data', (_req, res) => {
  const videos = db.prepare('SELECT * FROM videos ORDER BY category ASC, sort_order ASC').all() as Array<{
    id: string;
    url: string;
    category: string;
    sort_order: number;
    title: string | null;
  }>;

  const albums = db.prepare('SELECT * FROM albums ORDER BY sort_order ASC').all() as Array<any>;
  const merch = db.prepare('SELECT * FROM merch ORDER BY sort_order ASC').all() as Array<any>;
  const links = db.prepare('SELECT * FROM links ORDER BY sort_order ASC').all() as Array<any>;
  const info = db.prepare("SELECT * FROM info WHERE id = 'main'").get() as any;

  // Format channels
  const channels = {
    featured: videos.filter(v => v.category === 'featured').map(v => v.url),
    duets: videos.filter(v => v.category === 'duets').map(v => v.url),
    munchtime: videos.filter(v => v.category === 'munchtime').map(v => v.url),
  };

  return res.json({
    videos,
    channels,
    albums: albums.map(a => ({
      id: a.id,
      title: a.title,
      front: a.front,
      back: a.back,
      blurb: a.blurb,
      price: a.price,
      isPreorder: Boolean(a.is_preorder),
      isSoldOut: Boolean(a.is_sold_out),
      stripeUrl: a.stripe_url || undefined,
      spotify: a.spotify || undefined,
    })),
    merch: merch.map(m => ({
      id: m.id,
      title: m.title,
      type: m.type,
      front: m.front,
      back: m.back,
      blurb: m.blurb,
      price: m.price,
      stripeUrl: m.stripe_url || undefined,
    })),
    links,
    info: info || {
      about_text: '',
      management_email: '',
      general_email: '',
    },
  });
});

// ---------------- PROTECTED CRUD: VIDEOS ----------------

// GET /api/videos
router.get('/videos', (_req, res) => {
  const videos = db.prepare('SELECT * FROM videos ORDER BY category ASC, sort_order ASC').all();
  res.json(videos);
});

// POST /api/videos (add video)
router.post('/videos', requireAuth, (req, res) => {
  const { url, category, title } = req.body;
  if (!url || !category) {
    return res.status(400).json({ error: 'URL and category are required' });
  }

  const validCategories = ['featured', 'duets', 'munchtime'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Must be one of: ${validCategories.join(', ')}` });
  }

  const maxOrder = db.prepare('SELECT MAX(sort_order) as maxOrder FROM videos WHERE category = ?').get(category) as { maxOrder: number | null };
  const sortOrder = (maxOrder?.maxOrder ?? -1) + 1;
  const id = `${category}-${Date.now()}`;

  db.prepare(`
    INSERT INTO videos (id, url, category, sort_order, title) VALUES (?, ?, ?, ?, ?)
  `).run(id, url.trim(), category, sortOrder, title?.trim() || null);

  const created = db.prepare('SELECT * FROM videos WHERE id = ?').get(id);
  return res.status(201).json(created);
});

// PUT /api/videos/:id (update video)
router.put('/videos/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { url, category, title, sort_order } = req.body;

  const existing = db.prepare('SELECT * FROM videos WHERE id = ?').get(id) as any;
  if (!existing) {
    return res.status(404).json({ error: 'Video not found' });
  }

  db.prepare(`
    UPDATE videos 
    SET url = COALESCE(?, url),
        category = COALESCE(?, category),
        title = COALESCE(?, title),
        sort_order = COALESCE(?, sort_order)
    WHERE id = ?
  `).run(
    url ? url.trim() : null,
    category || null,
    title !== undefined ? title : null,
    sort_order !== undefined ? sort_order : null,
    id
  );

  const updated = db.prepare('SELECT * FROM videos WHERE id = ?').get(id);
  return res.json(updated);
});

// DELETE /api/videos/:id (delete video)
router.delete('/videos/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM videos WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Video not found' });
  }
  return res.json({ success: true });
});

// POST /api/videos/reorder (reorder videos in a category or bulk update)
router.post('/videos/reorder', requireAuth, (req, res) => {
  const { items } = req.body; // Array of { id: string, sort_order: number }
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Items array is required' });
  }

  const updateStmt = db.prepare('UPDATE videos SET sort_order = ? WHERE id = ?');
  const reorderTx = db.transaction(() => {
    for (const item of items) {
      updateStmt.run(item.sort_order, item.id);
    }
  });
  reorderTx();

  return res.json({ success: true });
});

// ---------------- PROTECTED CRUD: ALBUMS ----------------

// POST /api/albums
router.post('/albums', requireAuth, (req, res) => {
  const { title, front, back, blurb, price, isPreorder, isSoldOut, stripeUrl, spotify } = req.body;
  if (!title || !front) {
    return res.status(400).json({ error: 'Title and front image URL are required' });
  }

  const maxOrder = db.prepare('SELECT MAX(sort_order) as maxOrder FROM albums').get() as { maxOrder: number | null };
  const sortOrder = (maxOrder?.maxOrder ?? -1) + 1;
  const id = 'album-' + Date.now();

  db.prepare(`
    INSERT INTO albums (id, title, front, back, blurb, price, is_preorder, is_sold_out, stripe_url, spotify, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    title.trim(),
    front.trim(),
    back ? back.trim() : front.trim(),
    blurb || '',
    Number(price) || 20,
    isPreorder ? 1 : 0,
    isSoldOut ? 1 : 0,
    stripeUrl?.trim() || null,
    spotify?.trim() || null,
    sortOrder
  );

  return res.status(201).json({ id, title, front, back, blurb, price, isPreorder, isSoldOut, stripeUrl, spotify, sort_order: sortOrder });
});

// PUT /api/albums/:id
router.put('/albums/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { title, front, back, blurb, price, isPreorder, isSoldOut, stripeUrl, spotify, sort_order } = req.body;

  const existing = db.prepare('SELECT * FROM albums WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Album not found' });
  }

  db.prepare(`
    UPDATE albums 
    SET title = COALESCE(?, title),
        front = COALESCE(?, front),
        back = COALESCE(?, back),
        blurb = COALESCE(?, blurb),
        price = COALESCE(?, price),
        is_preorder = COALESCE(?, is_preorder),
        is_sold_out = COALESCE(?, is_sold_out),
        stripe_url = COALESCE(?, stripe_url),
        spotify = COALESCE(?, spotify),
        sort_order = COALESCE(?, sort_order)
    WHERE id = ?
  `).run(
    title !== undefined ? title.trim() : null,
    front !== undefined ? front.trim() : null,
    back !== undefined ? back.trim() : null,
    blurb !== undefined ? blurb : null,
    price !== undefined ? Number(price) : null,
    isPreorder !== undefined ? (isPreorder ? 1 : 0) : null,
    isSoldOut !== undefined ? (isSoldOut ? 1 : 0) : null,
    stripeUrl !== undefined ? stripeUrl?.trim() || '' : null,
    spotify !== undefined ? spotify?.trim() || '' : null,
    sort_order !== undefined ? sort_order : null,
    id
  );

  return res.json({ success: true });
});

// DELETE /api/albums/:id
router.delete('/albums/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM albums WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Album not found' });
  }
  return res.json({ success: true });
});

// ---------------- PROTECTED CRUD: MERCH ----------------

// POST /api/merch
router.post('/merch', requireAuth, (req, res) => {
  const { title, type, front, back, blurb, price, stripeUrl } = req.body;
  if (!title || !front) {
    return res.status(400).json({ error: 'Title and front image URL are required' });
  }

  const maxOrder = db.prepare('SELECT MAX(sort_order) as maxOrder FROM merch').get() as { maxOrder: number | null };
  const sortOrder = (maxOrder?.maxOrder ?? -1) + 1;
  const id = 'merch-' + Date.now();

  db.prepare(`
    INSERT INTO merch (id, title, type, front, back, blurb, price, stripe_url, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    title.trim(),
    type || 'shirt',
    front.trim(),
    back ? back.trim() : front.trim(),
    blurb || '',
    Number(price) || 30,
    stripeUrl?.trim() || null,
    sortOrder
  );

  return res.status(201).json({ id, title, type, front, back, blurb, price, stripeUrl, sort_order: sortOrder });
});

// PUT /api/merch/:id
router.put('/merch/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { title, type, front, back, blurb, price, stripeUrl, sort_order } = req.body;

  const existing = db.prepare('SELECT * FROM merch WHERE id = ?').get(id);
  if (!existing) {
    return res.status(404).json({ error: 'Merchandise item not found' });
  }

  db.prepare(`
    UPDATE merch 
    SET title = COALESCE(?, title),
        type = COALESCE(?, type),
        front = COALESCE(?, front),
        back = COALESCE(?, back),
        blurb = COALESCE(?, blurb),
        price = COALESCE(?, price),
        stripe_url = COALESCE(?, stripe_url),
        sort_order = COALESCE(?, sort_order)
    WHERE id = ?
  `).run(
    title !== undefined ? title.trim() : null,
    type !== undefined ? type : null,
    front !== undefined ? front.trim() : null,
    back !== undefined ? back.trim() : null,
    blurb !== undefined ? blurb : null,
    price !== undefined ? Number(price) : null,
    stripeUrl !== undefined ? stripeUrl?.trim() || '' : null,
    sort_order !== undefined ? sort_order : null,
    id
  );

  return res.json({ success: true });
});

// DELETE /api/merch/:id
router.delete('/merch/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const result = db.prepare('DELETE FROM merch WHERE id = ?').run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Merch not found' });
  }
  return res.json({ success: true });
});

// ---------------- PROTECTED CRUD: LINKS & INFO ----------------

// PUT /api/links (save full links list)
router.put('/links', requireAuth, (req, res) => {
  const { links } = req.body;
  if (!Array.isArray(links)) {
    return res.status(400).json({ error: 'Links array required' });
  }

  const replaceTx = db.transaction(() => {
    db.prepare('DELETE FROM links').run();
    const insertLink = db.prepare('INSERT INTO links (id, title, url, sort_order) VALUES (?, ?, ?, ?)');
    links.forEach((l, idx) => {
      insertLink.run(l.id || `link-${idx}`, l.title, l.url, idx);
    });
  });
  replaceTx();

  return res.json({ success: true });
});

// PUT /api/info (save info/contact)
router.put('/info', requireAuth, (req, res) => {
  const { about_text, management_email, general_email } = req.body;

  db.prepare(`
    INSERT INTO info (id, about_text, management_email, general_email)
    VALUES ('main', ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      about_text = excluded.about_text,
      management_email = excluded.management_email,
      general_email = excluded.general_email
  `).run(about_text || '', management_email || '', general_email || '');

  return res.json({ success: true });
});

// POST /api/export-to-data-file (syncs current SQLite state into src/data.ts for static hosts / git commits)
router.post('/export-to-data-file', requireAuth, (_req, res) => {
  try {
    const videos = db.prepare('SELECT * FROM videos ORDER BY category ASC, sort_order ASC').all() as Array<{
      id: string;
      url: string;
      category: string;
      sort_order: number;
    }>;
    const albums = db.prepare('SELECT * FROM albums ORDER BY sort_order ASC').all() as Array<any>;
    const merch = db.prepare('SELECT * FROM merch ORDER BY sort_order ASC').all() as Array<any>;

    const channels = {
      featured: videos.filter(v => v.category === 'featured').map(v => v.url),
      duets: videos.filter(v => v.category === 'duets').map(v => v.url),
      munchtime: videos.filter(v => v.category === 'munchtime').map(v => v.url),
    };

    const formattedAlbums = albums.map(a => ({
      title: a.title,
      front: a.front,
      back: a.back,
      blurb: a.blurb,
      price: a.price,
      ...(a.is_preorder ? { isPreorder: true } : {}),
      ...(a.is_sold_out ? { isSoldOut: true } : {}),
      ...(a.stripe_url ? { stripeUrl: a.stripe_url } : {}),
      ...(a.spotify ? { spotify: a.spotify } : {}),
    }));

    const formattedMerch = merch.map(m => ({
      id: m.id,
      title: m.title,
      type: m.type,
      front: m.front,
      back: m.back,
      blurb: m.blurb,
      price: m.price,
      ...(m.stripe_url ? { stripeUrl: m.stripe_url } : {}),
    }));

    const fileContent = `export const rawChannels = ${JSON.stringify(channels, null, 4)};\n\n` +
      `export const albums = ${JSON.stringify(formattedAlbums, null, 4)};\n\n` +
      `export const merch = ${JSON.stringify(formattedMerch, null, 4)};\n\n` +
      `export const storeItems = [\n` +
      `    ...merch.map(m => ({ ...m, type: 'merch' as const })),\n` +
      `    ...albums.map(a => ({ ...a, type: 'album' as const })),\n` +
      `];\n\n` +
      `const shuffle = <T>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);\n\n` +
      `export const playlist = [\n` +
      `    ...rawChannels.featured.map((url, i) => ({ id: \`feat-\${i}\`, url, category: 'featured' })),\n` +
      `    ...shuffle(rawChannels.duets).map((url, i) => ({ id: \`duet-\${i}\`, url, category: 'duets' })),\n` +
      `    ...shuffle(rawChannels.munchtime).map((url, i) => ({ id: \`munch-\${i}\`, url, category: 'munchtime' }))\n` +
      `];\n`;

    const dataPath = path.resolve(process.cwd(), 'src/data.ts');
    fs.writeFileSync(dataPath, fileContent, 'utf-8');
    return res.json({ success: true, message: 'Updated src/data.ts successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to export to data.ts' });
  }
});

// POST /api/reset (reset database back to defaults from data.ts)
router.post('/reset', requireAuth, (_req, res) => {
  db.exec(`
    DELETE FROM videos;
    DELETE FROM albums;
    DELETE FROM merch;
    DELETE FROM links;
    DELETE FROM info;
  `);
  // Re-seed
  initDatabase();
  return res.json({ success: true, message: 'Database reset to original defaults' });
});
