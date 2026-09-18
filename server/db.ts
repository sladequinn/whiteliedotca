import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { rawChannels, albums, merch } from '../src/data.js';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'whitelie.db');
export const db = new Database(DB_PATH);

// Pragmas for performance and concurrency
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');

export function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { salt, hash };
}

export function verifyPassword(password: string, salt: string, expectedHash: string): boolean {
  try {
    const computedHash = crypto.scryptSync(password, salt, 64);
    const expectedBuffer = Buffer.from(expectedHash, 'hex');
    return crypto.timingSafeEqual(computedHash, expectedBuffer);
  } catch {
    return false;
  }
}

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_user (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      salt TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      username TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL
    );

    CREATE TABLE IF NOT EXISTS videos (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      category TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS albums (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      blurb TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 20,
      is_preorder INTEGER DEFAULT 0,
      is_sold_out INTEGER DEFAULT 0,
      stripe_url TEXT,
      spotify TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS merch (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      front TEXT NOT NULL,
      back TEXT NOT NULL,
      blurb TEXT NOT NULL,
      price REAL NOT NULL DEFAULT 30,
      stripe_url TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS links (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      url TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS info (
      id TEXT PRIMARY KEY,
      about_text TEXT NOT NULL,
      management_email TEXT NOT NULL,
      general_email TEXT NOT NULL
    );
  `);

  // Seed default admin user if not exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM admin_user').get() as { count: number };
  if (userCount.count === 0) {
    const initialPass = process.env.ADMIN_PASSWORD || 'whitelie519';
    const { salt, hash } = hashPassword(initialPass);
    db.prepare('INSERT INTO admin_user (id, username, password_hash, salt) VALUES (1, ?, ?, ?)')
      .run('whitelie', hash, salt);
  }

  // Seed videos if empty
  const videoCount = db.prepare('SELECT COUNT(*) as count FROM videos').get() as { count: number };
  if (videoCount.count === 0) {
    const insertVideo = db.prepare(`
      INSERT INTO videos (id, url, category, sort_order) VALUES (?, ?, ?, ?)
    `);
    const seedAll = db.transaction(() => {
      let order = 0;
      for (const url of rawChannels.featured) {
        insertVideo.run(`feat-${order}`, url, 'featured', order);
        order++;
      }
      order = 0;
      for (const url of rawChannels.duets) {
        insertVideo.run(`duet-${order}`, url, 'duets', order);
        order++;
      }
      order = 0;
      for (const url of rawChannels.munchtime) {
        insertVideo.run(`munch-${order}`, url, 'munchtime', order);
        order++;
      }
    });
    seedAll();
  }

  // Seed albums if empty
  const albumCount = db.prepare('SELECT COUNT(*) as count FROM albums').get() as { count: number };
  if (albumCount.count === 0) {
    const insertAlbum = db.prepare(`
      INSERT INTO albums (id, title, front, back, blurb, price, is_preorder, is_sold_out, stripe_url, spotify, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const seedAlbums = db.transaction(() => {
      albums.forEach((album, idx) => {
        const id = 'album-' + album.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        insertAlbum.run(
          id,
          album.title,
          album.front,
          album.back,
          album.blurb,
          album.price,
          album.isPreorder ? 1 : 0,
          album.isSoldOut ? 1 : 0,
          album.stripeUrl || null,
          album.spotify || null,
          idx
        );
      });
    });
    seedAlbums();
  }

  // Seed merch if empty
  const merchCount = db.prepare('SELECT COUNT(*) as count FROM merch').get() as { count: number };
  if (merchCount.count === 0) {
    const insertMerch = db.prepare(`
      INSERT INTO merch (id, title, type, front, back, blurb, price, stripe_url, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const seedMerch = db.transaction(() => {
      merch.forEach((item, idx) => {
        insertMerch.run(
          item.id,
          item.title,
          item.type,
          item.front,
          item.back,
          item.blurb,
          item.price,
          item.stripeUrl || null,
          idx
        );
      });
    });
    seedMerch();
  }

  // Seed links if empty
  const linkCount = db.prepare('SELECT COUNT(*) as count FROM links').get() as { count: number };
  if (linkCount.count === 0) {
    const insertLink = db.prepare(`
      INSERT INTO links (id, title, url, sort_order) VALUES (?, ?, ?, ?)
    `);
    const defaultLinks = [
      { id: 'spotify', title: 'SPOTIFY', url: 'https://open.spotify.com/artist/6IgPg8MO2tPuQFHcM6MF4o', order: 0 },
      { id: 'applemusic', title: 'APPLE MUSIC', url: 'https://music.apple.com/ca/artist/lil-white-lie/1496696984', order: 1 },
      { id: 'tiktok', title: 'TIKTOK', url: 'https://www.tiktok.com/@whitelie519', order: 2 },
      { id: 'instagram', title: 'INSTAGRAM', url: 'https://www.instagram.com/lilwhitelie519', order: 3 },
      { id: 'youtube', title: 'YOUTUBE', url: 'https://www.youtube.com/@ThaLilWhiteLie', order: 4 },
    ];
    const seedLinks = db.transaction(() => {
      for (const link of defaultLinks) {
        insertLink.run(link.id, link.title, link.url, link.order);
      }
    });
    seedLinks();
  }

  // Seed info if empty
  const infoCount = db.prepare('SELECT COUNT(*) as count FROM info').get() as { count: number };
  if (infoCount.count === 0) {
    const aboutText = `WH!TE L!E is a boundary-pushing artist blending raw energy with meticulously crafted soundscapes. Known for high-octane performances and a unique visual aesthetic, the music speaks to the chaotic beauty of modern life.\n\nHailing from the underground and rising to mainstream consciousness, WH!TE L!E continues to redefine what it means to be an independent creator in the digital age.`;
    db.prepare(`
      INSERT INTO info (id, about_text, management_email, general_email)
      VALUES ('main', ?, 'lilwhitelie1@gmail.com', 'lilwhitelie1@gmail.com')
    `).run(aboutText);
  }
}
