// Helpers to generate src/data.ts content and trigger downloads / clipboard copies

import { VideoItem, AlbumItem, MerchItem, RawChannels } from '../context/AppDataContext';

export function generateDataTsCode(channels: RawChannels, albums: AlbumItem[], merch: MerchItem[]): string {
  const formattedAlbums = albums.map(a => ({
    title: a.title,
    front: a.front,
    back: a.back,
    blurb: a.blurb,
    price: a.price,
    ...(a.isPreorder ? { isPreorder: true } : {}),
    ...(a.isSoldOut ? { isSoldOut: true } : {}),
    ...(a.stripeUrl ? { stripeUrl: a.stripeUrl } : {}),
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
    ...(m.stripeUrl ? { stripeUrl: m.stripeUrl } : {}),
  }));

  return `export const rawChannels = ${JSON.stringify(channels, null, 4)};\n\n` +
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
}

export function downloadDataFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/typescript;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
