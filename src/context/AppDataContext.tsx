import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { rawChannels as defaultRawChannels, albums as defaultAlbums, merch as defaultMerch } from '../data';

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

const AppDataContext = createContext<AppDataContextType | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('wl_auth_token'));
  const [currentUser, setCurrentUser] = useState<string | null>(() => localStorage.getItem('wl_auth_user'));
  const [isLoading, setIsLoading] = useState(true);

  // Initial fallback to data.ts defaults
  const [channels, setChannels] = useState<RawChannels>(defaultRawChannels);
  const [videos, setVideos] = useState<VideoItem[]>(() => {
    const v: VideoItem[] = [];
    defaultRawChannels.featured.forEach((url, i) => v.push({ id: `feat-${i}`, url, category: 'featured', sort_order: i }));
    defaultRawChannels.duets.forEach((url, i) => v.push({ id: `duet-${i}`, url, category: 'duets', sort_order: i }));
    defaultRawChannels.munchtime.forEach((url, i) => v.push({ id: `munch-${i}`, url, category: 'munchtime', sort_order: i }));
    return v;
  });
  const [albums, setAlbums] = useState<AlbumItem[]>(defaultAlbums as AlbumItem[]);
  const [merch, setMerch] = useState<MerchItem[]>(defaultMerch as MerchItem[]);
  const [links, setLinks] = useState<LinkItem[]>(defaultLinks);
  const [info, setInfo] = useState<InfoItem>(defaultInfo);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(() => buildPlaylist(defaultRawChannels));

  const authHeaders = useCallback(() => {
    const t = token || localStorage.getItem('wl_auth_token');
    return t ? { Authorization: `Bearer ${t}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  }, [token]);

  const refreshData = useCallback(async () => {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
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
      }
    } catch (err) {
      console.warn('API unavailable, falling back to local state:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Auth verification
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          if (!res.ok) {
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
    if (token) {
      fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('wl_auth_token');
    localStorage.removeItem('wl_auth_user');
  };

  // Video mutations
  const addVideo = async (video: { url: string; category: string; title?: string }) => {
    const res = await fetch('/api/videos', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(video),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add video');
    }
    const created: VideoItem = await res.json();
    await refreshData();
    return created;
  };

  const updateVideo = async (id: string, updates: Partial<VideoItem>) => {
    const res = await fetch(`/api/videos/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update video');
    }
    const updated: VideoItem = await res.json();
    await refreshData();
    return updated;
  };

  const deleteVideo = async (id: string) => {
    const res = await fetch(`/api/videos/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete video');
    }
    await refreshData();
  };

  const reorderVideos = async (items: { id: string; sort_order: number }[]) => {
    const res = await fetch('/api/videos/reorder', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ items }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to reorder videos');
    }
    await refreshData();
  };

  // Album mutations
  const addAlbum = async (album: AlbumItem) => {
    const res = await fetch('/api/albums', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(album),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add album');
    }
    await refreshData();
  };

  const updateAlbum = async (id: string, updates: Partial<AlbumItem>) => {
    const res = await fetch(`/api/albums/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update album');
    }
    await refreshData();
  };

  const deleteAlbum = async (id: string) => {
    const res = await fetch(`/api/albums/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete album');
    }
    await refreshData();
  };

  // Merch mutations
  const addMerch = async (item: MerchItem) => {
    const res = await fetch('/api/merch', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(item),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to add merch');
    }
    await refreshData();
  };

  const updateMerch = async (id: string, updates: Partial<MerchItem>) => {
    const res = await fetch(`/api/merch/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update merch');
    }
    await refreshData();
  };

  const deleteMerch = async (id: string) => {
    const res = await fetch(`/api/merch/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to delete merch');
    }
    await refreshData();
  };

  // Links & Info
  const updateLinks = async (newLinks: LinkItem[]) => {
    const res = await fetch('/api/links', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ links: newLinks }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update links');
    }
    await refreshData();
  };

  const updateInfo = async (newInfo: InfoItem) => {
    const res = await fetch('/api/info', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(newInfo),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update info');
    }
    await refreshData();
  };

  const resetToDefaults = async () => {
    const res = await fetch('/api/reset', {
      method: 'POST',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to reset database');
    }
    await refreshData();
  };

  const exportToDataFile = async () => {
    const res = await fetch('/api/export-to-data-file', {
      method: 'POST',
      headers: authHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to export data');
    }
  };

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
