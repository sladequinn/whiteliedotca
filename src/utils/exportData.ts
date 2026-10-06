export interface DataFileChannels {
  featured: string[];
  duets: string[];
  munchtime: string[];
}

export interface DataFileAlbum {
  title: string;
  front: string;
  back: string;
  blurb: string;
  price: number;
  isPreorder?: boolean;
  isSoldOut?: boolean;
  stripeUrl?: string;
  spotify?: string;
}

export interface DataFileMerch {
  id: string;
  title: string;
  type: string;
  front: string;
  back: string;
  blurb: string;
  price: number;
  stripeUrl?: string;
}

export interface DataFileLink {
  id: string;
  title: string;
  url: string;
  sort_order?: number;
}

export interface DataFileInfo {
  about_text: string;
  management_email: string;
  general_email: string;
}

export interface DataFilePayload {
  channels: DataFileChannels;
  albums: DataFileAlbum[];
  merch: DataFileMerch[];
  links: DataFileLink[];
  info: DataFileInfo;
}

export function generateDataTsCode(payload: DataFilePayload): string {
  const formattedAlbums = payload.albums.map(a => ({
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

  const formattedMerch = payload.merch.map(m => ({
    id: m.id,
    title: m.title,
    type: m.type,
    front: m.front,
    back: m.back,
    blurb: m.blurb,
    price: m.price,
    ...(m.stripeUrl ? { stripeUrl: m.stripeUrl } : {}),
  }));

  const formattedLinks = payload.links.map((link, idx) => ({
    id: link.id,
    title: link.title,
    url: link.url,
    sort_order: link.sort_order ?? idx,
  }));

  return `export const rawChannels = ${JSON.stringify(payload.channels, null, 4)};\n\n` +
    `export const albums = ${JSON.stringify(formattedAlbums, null, 4)};\n\n` +
    `export const merch = ${JSON.stringify(formattedMerch, null, 4)};\n\n` +
    `export const siteLinks = ${JSON.stringify(formattedLinks, null, 4)};\n\n` +
    `export const siteInfo = ${JSON.stringify(payload.info, null, 4)};\n\n` +
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
