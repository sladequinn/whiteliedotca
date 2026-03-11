# WH!TE L!E - Interactive TV & Store

This is a React-based web application featuring a retro TV interface with channel surfing, and a 3D coverflow store for physical albums.

## 📁 Project Structure

Here is a quick breakdown of what the most important files do:

* **`src/App.tsx`** 
  The main application file. This controls the retro TV interface, the static noise transitions, and the channel surfing logic.
* **`src/components/StoreOverlay.tsx`** 
  The 3D album store. This contains the logic for the scrolling coverflow, the 3D tilt effect, and the shopping cart quantities.
* **`src/data.ts`** 
  The database. This is where all the video links (featured, duets, munchtime) and the album details (titles, images, prices, Spotify links) are stored. If you want to add a new video or album, you do it here.
* **`src/index.css`** 
  The styling file. This contains the Tailwind CSS setup, the TV scanline effects, and all the complex 3D math and plastic wrap glare effects for the albums.
* **`package.json`** 
  The instruction manual for Node.js. It tells the system what libraries to install (like React and Tailwind) and how to run the app.
* **`vite.config.ts`** 
  The configuration file for Vite, which is the tool used to build and run this React project quickly.

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
