# WH!TE L!E - Interactive TV & Store

This is a React-based web application featuring a retro TV interface with channel surfing, and a 3D coverflow store for physical albums.

## 📁 Project Structure

Here is a quick breakdown of what the most important files do:

* **`src/App.tsx`** 
  The main application file. This controls the retro TV interface, the static noise transitions, and the channel surfing logic.
* **`src/components/admin/`**
  The Backstage Admin Panel. Allows White Lie to log in, add, edit, reorder, and delete video URLs, album releases, merchandise items, links, and artist bio.
* **`server/`**
  Express API server and SQLite database (`whitelie.db`). Handles authenticated REST endpoints (`/api/auth/*`, `/api/videos/*`, `/api/albums/*`, `/api/merch/*`, `/api/links`, `/api/info`).
* **`src/components/StoreOverlay.tsx`** 
  The 3D album store. This contains the logic for the scrolling coverflow, the 3D tilt effect, and the shopping cart quantities.
* **`src/data.ts`** 
  Default initial content for videos, albums, and merch. Seeded into SQLite on initial launch.
* **`src/index.css`** 
  The styling file. This contains the Tailwind CSS setup, the TV scanline effects, and all the complex 3D math and plastic wrap glare effects for the albums.
* **`package.json`** 
  The instruction manual for Node.js. It tells the system what libraries to install (like React and Tailwind) and how to run the app.
* **`vite.config.ts`** 
  The configuration file for Vite, with integrated Express API middleware for seamless local and production dev.

## 🔐 Backstage Admin Panel

To access the admin panel:
1. Click **`[BACKSTAGE]`** next to the **`WH!TE L!E`** logo in the bottom-left corner of the HUD, OR
2. Navigate to `http://localhost:3000/#admin` or `http://localhost:3000/?admin`

**Default Credentials:**
* **Username:** `whitelie`
* **Password:** `whitelie519` *(can be changed directly in the Security tab of the Admin Panel)*

### Features:
* **Video Reel Manager:** Add new video URLs (Cloudinary, MP4, WebM), preview videos in a popup player, edit video URLs/titles/categories, reorder playback sequence with up/down touch-friendly arrows, and delete videos across Featured, Duets, and Munchtime channels.
* **Hosting Guide for Videos:** Helpful in-app guide explaining why videos are hosted externally via URLs (Cloudinary / S3 / R2) instead of committed to Git (which has file size limits and lacks video streaming chunking).
* **Albums & Releases Manager:** Manage vinyl/cassette releases, front & back artwork URLs, descriptions, prices, Pre-Order & Sold Out badges, Spotify links, and Stripe checkout buttons.
* **Apparel & Merch Manager:** Manage shirts, hoodies, prices, front & back 3D garment artwork, and Stripe payment links.
* **Links & Bio Manager:** Update all external streaming/social links (Spotify, Apple Music, TikTok, Instagram, YouTube) and artist contact/bio copy.
* **GitHub Sync & Static Export:** One-click button in the Security tab to sync all current videos, albums, and merch directly into `src/data.ts`. This ensures static GitHub / Vercel / Netlify builds always reflect your latest changes.
* **Security & Factory Reset:** Update admin password securely (scrypt hash + salt) and reset back to original seed data with one click if needed.
* **Mobile-Optimized:** Fully responsive on phones and tablets with sticky top header, horizontal touch-scrolling tabs, enlarged touch targets, safe-area padding, and font scaling to prevent auto-zoom on iOS.

## 🚀 How to Run Locally

If you download this code to your computer, you will need [Node.js](https://nodejs.org/) installed. 

1. Open your terminal and navigate to this folder.
2. Run `npm install` to download all the required libraries.
3. Run `npm run dev` to start the local development server.
4. Open `http://localhost:3000` in your browser.

## 🌐 How to Deploy

Once this code is on GitHub, the easiest way to get it live on the internet is to use a free hosting service like **Vercel** or **Netlify**:

1. Go to [Vercel.com](https://vercel.com/) or [Netlify.com](https://netlify.com/) and sign up with your GitHub account.
2. Click "Add New Project" and select your GitHub repository.
3. The platform will automatically detect that it's a Vite/React app.
4. Click "Deploy" and it will give you a live URL in a few minutes!
