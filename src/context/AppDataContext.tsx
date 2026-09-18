import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { rawChannels as defaultRawChannels, albums as defaultAlbums, merch as defaultMerch } from '../data';
import { generateDataTsCode, downloadDataFile } from '../utils/exportData';

export interface VideoItem {
  id: string;
  url: string;
  category: 'featured' | 'duets' | 'munchtime';
  sort_order?: number;
  title?: string | null;
}

export interface PlaylistItem {
  id: string;
  url: string;
  category: string;
}

export interface AlbumItem {
  id?: string;
  title: string;
  front: string;
  back: string;
  blurb: string;
  price: number;
  isPreorder?: boolean;
  isSoldOut?: boolean;
  stripeUrl?: string;
  spotify?: string;
  sort_order?: number;
}

export interface MerchItem {
  id: string;
  title: string;
  type: string;
  front: string;
  back: string;
  blurb: string;
  price: number;
  stripeUrl?: string;
  sort_order?: number;
}

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  sort_order?: number;
}

export interface InfoItem {
  about_text: string;
  management_email: string;
  general_email: string;
}

export interface RawChannels {
  featured: string[];
  duets: string[];
  munchtime: string[];
}

interface AppDataContextType {
  videos: VideoItem[];
  channels: RawChannels;
  playlist: PlaylistItem[];
  albums: AlbumItem[];
  merch: MerchItem[];
  links: LinkItem[];
  info: InfoItem;
  isLoading: boolean;
  token: string | null;
  currentUser: string | null;
  login: (token: string, username: string) => void;
  logout: () => void;
  refreshData: () => Promise<void>;
  // Video mutations
  addVideo: (video: { url: string; category: string; title?: string }) => Promise<VideoItem>;
  updateVideo: (id: string, updates: Partial<VideoItem>) => Promise<VideoItem>;
  deleteVideo: (id: string) => Promise<void>;
  reorderVideos: (items: { id: string; sort_order: number }[]) => Promise<void>;
  // Album mutations
  addAlbum: (album: AlbumItem) => Promise<void>;
  updateAlbum: (id: string, updates: Partial<AlbumItem>) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
  // Merch mutations
  addMerch: (merch: MerchItem) => Promise<void>;
  updateMerch: (id: string, updates: Partial<MerchItem>) => Promise<void>;
  deleteMerch: (id: string) => Promise<void>;
  // Links & Info
  updateLinks: (links: LinkItem[]) => Promise<void>;
  updateInfo: (info: InfoItem) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  exportToDataFile: () => Promise<void>;
  downloadDataFileLocal: () => void;
  getDataFileCode: () => string;
}

const defaultLinks: LinkItem[] = [
  { id: 'spotify', title: 'SPOTIFY', url: 'https://open.spotify.com/artist/6IgPg8MO2tPuQFHcM6MF4o' },
  { id: 'applemusic', title: 'APPLE MUSIC', url: 'https://music.apple.com/ca/artist/lil-white-lie/1496696984' },
  { id: 'tiktok', title: 'TIKTOK', url: 'https://www.tiktok.com/@whitelie519' },
  { id: 'instagram', title: 'INSTAGRAM', url: 'https://www.instagram.com/lilwhitelie519' },
  { id: 'youtube', title: 'YOUTUBE', url: 'https://www.youtube.com/@ThaLilWhiteLie' },
];

const defaultInfo: InfoItem = {
  about_text: `WH!TE L!E is a boundary-pushing artist blending raw energy with meticulously crafted soundscapes. Known for high-octane performances and a unique visual aesthetic, the music speaks to the chaotic beauty of modern life.\n\nHailing from the underground and rising to mainstream consciousness, WH!TE L!E continues to redefine what it means to be an independent creator in the digital age.`,
  management_email: 'lilwhitelie1@gmail.com',
  general_email: 'lilwhitelie1@gmail.com',
};

function buildPlaylist(channels: RawChannels): PlaylistItem[] {
  const shuffle = <T,>(array: T[]): T[] => [...array].sort(() => Math.random() - 0.5);
  return [
    ...channels.featured.map((url, i) => ({ id: `feat-${i}`, url, category: 'featured' })),
    ...shuffle(channels.duets).map((url, i) => ({ id: `duet-${i}`, url, category: 'duets' })),
    ...shuffle(channels.munchtime).map((url, i) => ({ id: `munch-${i}`, url, category: 'munchtime' })),
  ];
}

const LOCAL_STORAGE_DATA_KEY = 'wl_custom_app_data_v1';

const AppDataContext = createContext<AppDataContextType | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('wl_auth_token'));
  const [currentUser, setCurrentUser] = useState<string | null>(() => localStorage.getItem('wl_auth_user'));
  const [isLoading, setIsLoading] = useState(true);

  // Initialize state: prefer localStorage cache if available, fallback to hardcoded data.ts
  const [channels, setChannels] = useState<RawChannels>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DATA_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.channels) return parsed.channels;
      }
    } catch {}
    return defaultRawChannels;
  });

  const [videos, setVideos] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DATA_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.videos) return parsed.videos;
      }
    } catch {}
    const v: VideoItem[] = [];
    defaultRawChannels.featured.forEach((url, i) => v.push({ id: `feat-${i}`, url, category: 'featured', sort_order: i }));
    defaultRawChannels.duets.forEach((url, i) => v.push({ id: `duet-${i}`, url, category: 'duets', sort_order: i }));
    defaultRawChannels.munchtime.forEach((url, i) => v.push({ id: `munch-${i}`, url, category: 'munchtime', sort_order: i }));
    return v;
  });

  const [albums, setAlbums] = useState<AlbumItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DATA_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.albums) return parsed.albums;
      }
    } catch {}
    return defaultAlbums as AlbumItem[];
  });

  const [merch, setMerch] = useState<MerchItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DATA_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.merch) return parsed.merch;
      }
    } catch {}
    return defaultMerch as MerchItem[];
  });

  const [links, setLinks] = useState<LinkItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DATA_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.links) return parsed.links;
      }
    } catch {}
    return defaultLinks;
  });

  const [info, setInfo] = useState<InfoItem>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DATA_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.info) return parsed.info;
      }
    } catch {}
    return defaultInfo;
  });

  const [playlist, setPlaylist] = useState<PlaylistItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_DATA_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.channels) return buildPlaylist(parsed.channels);
      }
    } catch {}
    return buildPlaylist(defaultRawChannels);
  });

  // Sync current client state into localStorage
  const saveStateToLocalStorage = useCallback((data: {
    videos?: VideoItem[];
    channels?: RawChannels;
    albums?: AlbumItem[];
    merch?: MerchItem[];
    links?: LinkItem[];
    info?: InfoItem[];
  }) => {
    try {
      const currentRaw = localStorage.getItem(LOCAL_STORAGE_DATA_KEY);
      const current = currentRaw ? JSON.parse(currentRaw) : {};
      const updated = { ...current, ...data };
      localStorage.setItem(LOCAL_STORAGE_DATA_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to save state to localStorage:', err);
    }
  }, []);

  const authHeaders = useCallback(() => {
    const t = token || localStorage.getItem('wl_auth_token');
    return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  }, [token]);

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.channels) {
          setChannels(data.channels);
          setPlaylist(buildPlaylist(data.channels));
        }
        if (data.videos) setVideos(data.videos);
        if (data.albums) setAlbums(data.albums);
        if (data.merch) setMerch(data.merch);
        if (data.links) setLinks(data.links);
        if (data.info) setInfo(data.info);

        // Also update local storage cache with freshest server data
        saveStateToLocalStorage({
          videos: data.videos,
          channels: data.channels,
          albums: data.albums,
          merch: data.merch,
          links: data.links,
          info: data.info,
        });
      }
    } catch (err) {
      console.warn('API unavailable, keeping current state:', err);
    } finally {
      setIsLoading(false);
    }
  }, [saveStateToLocalStorage]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auth verification: only if token is from server (not client static_ token)
  useEffect(() => {
    if (token && !token.startsWith('static_')) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          const contentType = res.headers.get('content-type') || '';
          if (res.ok && contentType.includes('application/json')) {
            // Token is valid
          } else if (res.status === 401) {
            logout();
          }
        })
        .catch(() => {});
    }
  }, [token]);

  const login = (newToken: string, username: string) => {
    setToken(newToken);
    setCurrentUser(username);
    localStorage.setItem('wl_auth_token', newToken);
    localStorage.setItem('wl_auth_user', username);
  };

  const logout = () => {
    if (token && !token.startsWith('static_')) {
      fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('wl_auth_token');
    localStorage.removeItem('wl_auth_user');
  };

  // Video mutations
  const addVideo = async (video: { url: string; category: string; title?: string }) => {
    let created: VideoItem | null = null;
    try {
      const res = await fetch('/api/videos', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(video),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        created = await res.json();
      }
    } catch {}

    // Fallback or local state update
    const category = video.category as 'featured' | 'duets' | 'munchtime';
    const finalVideo: VideoItem = created || {
      id: `${category.substring(0, 4)}-${Date.now()}`,
      url: video.url,
      category,
      title: video.title || null,
      sort_order: videos.filter(v => v.category === category).length,
    };

    setVideos(prev => {
      const next = [...prev, finalVideo];
      const nextChannels = {
        featured: next.filter(v => v.category === 'featured').map(v => v.url),
        duets: next.filter(v => v.category === 'duets').map(v => v.url),
        munchtime: next.filter(v => v.category === 'munchtime').map(v => v.url),
      };
      setChannels(nextChannels);
      setPlaylist(buildPlaylist(nextChannels));
      saveStateToLocalStorage({ videos: next, channels: nextChannels });
      return next;
    });

    return finalVideo;
  };

  const updateVideo = async (id: string, updates: Partial<VideoItem>) => {
    let updatedVideo: VideoItem | null = null;
    try {
      const res = await fetch(`/api/videos/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updates),
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        updatedVideo = await res.json();
      }
    } catch {}

    setVideos(prev => {
      const next = prev.map(v => (v.id === id ? { ...v, ...updates } : v));
      const nextChannels = {
        featured: next.filter(v => v.category === 'featured').map(v => v.url),
        duets: next.filter(v => v.category === 'duets').map(v => v.url),
        munchtime: next.filter(v => v.category === 'munchtime').map(v => v.url),
      };
      setChannels(nextChannels);
      setPlaylist(buildPlaylist(nextChannels));
      saveStateToLocalStorage({ videos: next, channels: nextChannels });
      return next;
    });

    return updatedVideo || { id, url: '', category: 'featured', ...updates };
  };

  const deleteVideo = async (id: string) => {
    try {
      await fetch(`/api/videos/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
    } catch {}

    setVideos(prev => {
      const next = prev.filter(v => v.id !== id);
      const nextChannels = {
        featured: next.filter(v => v.category === 'featured').map(v => v.url),
        duets: next.filter(v => v.category === 'duets').map(v => v.url),
        munchtime: next.filter(v => v.category === 'munchtime').map(v => v.url),
      };
      setChannels(nextChannels);
      setPlaylist(buildPlaylist(nextChannels));
      saveStateToLocalStorage({ videos: next, channels: nextChannels });
      return next;
    });
  };

  const reorderVideos = async (items: { id: string; sort_order: number }[]) => {
    try {
      await fetch('/api/videos/reorder', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ items }),
      });
    } catch {}

    setVideos(prev => {
      const map = new Map(items.map(item => [item.id, item.sort_order]));
      const next = prev.map(v => (map.has(v.id) ? { ...v, sort_order: map.get(v.id)! } : v));
      const nextChannels = {
        featured: next.filter(v => v.category === 'featured').sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map(v => v.url),
        duets: next.filter(v => v.category === 'duets').sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map(v => v.url),
        munchtime: next.filter(v => v.category === 'munchtime').sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)).map(v => v.url),
      };
      setChannels(nextChannels);
      setPlaylist(buildPlaylist(nextChannels));
      saveStateToLocalStorage({ videos: next, channels: nextChannels });
      return next;
    });
  };

  // Album mutations
  const addAlbum = async (album: AlbumItem) => {
    try {
      await fetch('/api/albums', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(album),
      });
    } catch {}

    const id = album.id || 'album-' + album.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newAlbum = { ...album, id };
    setAlbums(prev => {
      const next = [...prev, newAlbum];
      saveStateToLocalStorage({ albums: next });
      return next;
    });
  };

  const updateAlbum = async (id: string, updates: Partial<AlbumItem>) => {
    try {
      await fetch(`/api/albums/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updates),
      });
    } catch {}

    setAlbums(prev => {
      const next = prev.map(a => (a.id === id || a.title === id ? { ...a, ...updates } : a));
      saveStateToLocalStorage({ albums: next });
      return next;
    });
  };

  const deleteAlbum = async (id: string) => {
    try {
      await fetch(`/api/albums/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
    } catch {}

    setAlbums(prev => {
      const next = prev.filter(a => a.id !== id && a.title !== id);
      saveStateToLocalStorage({ albums: next });
      return next;
    });
  };

  // Merch mutations
  const addMerch = async (item: MerchItem) => {
    try {
      await fetch('/api/merch', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(item),
      });
    } catch {}

    setMerch(prev => {
      const next = [...prev, item];
      saveStateToLocalStorage({ merch: next });
      return next;
    });
  };

  const updateMerch = async (id: string, updates: Partial<MerchItem>) => {
    try {
      await fetch(`/api/merch/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(updates),
      });
    } catch {}

    setMerch(prev => {
      const next = prev.map(m => (m.id === id ? { ...m, ...updates } : m));
      saveStateToLocalStorage({ merch: next });
      return next;
    });
  };

  const deleteMerch = async (id: string) => {
    try {
      await fetch(`/api/merch/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
    } catch {}

    setMerch(prev => {
      const next = prev.filter(m => m.id !== id);
      saveStateToLocalStorage({ merch: next });
      return next;
    });
  };

  // Links & Info
  const updateLinks = async (newLinks: LinkItem[]) => {
    try {
      await fetch('/api/links', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ links: newLinks }),
      });
    } catch {}

    setLinks(newLinks);
    saveStateToLocalStorage({ links: newLinks });
  };

  const updateInfo = async (newInfo: InfoItem) => {
    try {
      await fetch('/api/info', {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(newInfo),
      });
    } catch {}

    setInfo(newInfo);
    saveStateToLocalStorage({ info: [newInfo] as any });
  };

  const resetToDefaults = async () => {
    try {
      await fetch('/api/reset', {
        method: 'POST',
        headers: authHeaders(),
      });
    } catch {}

    localStorage.removeItem(LOCAL_STORAGE_DATA_KEY);
    setChannels(defaultRawChannels);
    const v: VideoItem[] = [];
    defaultRawChannels.featured.forEach((url, i) => v.push({ id: `feat-${i}`, url, category: 'featured', sort_order: i }));
    defaultRawChannels.duets.forEach((url, i) => v.push({ id: `duet-${i}`, url, category: 'duets', sort_order: i }));
    defaultRawChannels.munchtime.forEach((url, i) => v.push({ id: `munch-${i}`, url, category: 'munchtime', sort_order: i }));
    setVideos(v);
    setAlbums(defaultAlbums as AlbumItem[]);
    setMerch(defaultMerch as MerchItem[]);
    setLinks(defaultLinks);
    setInfo(defaultInfo);
    setPlaylist(buildPlaylist(defaultRawChannels));
  };

  const exportToDataFile = async () => {
    const res = await fetch('/api/export-to-data-file', {
      method: 'POST',
      headers: authHeaders(),
    });
    const contentType = res.headers.get('content-type') || '';
    if (!res.ok || !contentType.includes('application/json')) {
      throw new Error('Server export endpoint is unavailable on static hosting. Use "Download data.ts" instead!');
    }
  };

  const getDataFileCode = useCallback(() => {
    return generateDataTsCode(channels, albums, merch);
  }, [channels, albums, merch]);

  const downloadDataFileLocal = useCallback(() => {
    const code = generateDataTsCode(channels, albums, merch);
    downloadDataFile('data.ts', code);
  }, [channels, albums, merch]);

  return (
    <AppDataContext.Provider
      value={{
        videos,
        channels,
        playlist,
        albums,
        merch,
        links,
        info,
        isLoading,
        token,
        currentUser,
        login,
        logout,
        refreshData,
        addVideo,
        updateVideo,
        deleteVideo,
        reorderVideos,
        addAlbum,
        updateAlbum,
        deleteAlbum,
        addMerch,
        updateMerch,
        deleteMerch,
        updateLinks,
        updateInfo,
        resetToDefaults,
        exportToDataFile,
        downloadDataFileLocal,
        getDataFileCode,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
