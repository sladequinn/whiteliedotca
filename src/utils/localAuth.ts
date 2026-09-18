// Browser-compatible crypto helpers for password hashing & verification
// Uses standard Web Crypto API (SubtleCrypto) so it runs in any browser without Node.js

const DEFAULT_ADMIN_USER = 'whitelie';
const DEFAULT_PASSWORD = 'whitelie519';
const STORAGE_PREFIX = 'wl_admin_';

// Helper: Convert buffer to hex string
function buf2hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Helper: Convert hex string to Uint8Array
function hex2buf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return bytes;
}

// PBKDF2 hash using SHA-256 (standard Web Crypto, works in all modern browsers and Node)
export async function hashPasswordWeb(password: string, saltHex?: string): Promise<{ hash: string; salt: string }> {
  const enc = new TextEncoder();
  const salt = saltHex ? hex2buf(saltHex) : crypto.getRandomValues(new Uint8Array(16));
  
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt as any,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );

  return {
    hash: buf2hex(derivedBits),
    salt: saltHex || buf2hex(salt.buffer),
  };
}

export async function verifyPasswordWeb(password: string, salt: string, expectedHash: string): Promise<boolean> {
  try {
    const { hash } = await hashPasswordWeb(password, salt);
    return hash === expectedHash;
  } catch {
    return false;
  }
}

// Client-side authentication for static hosting (Vercel / GitHub Pages)
export async function authenticateLocal(username: string, password: string): Promise<{ token: string; username: string }> {
  // Check custom password if set, otherwise default
  const storedUser = localStorage.getItem(`${STORAGE_PREFIX}user`) || DEFAULT_ADMIN_USER;
  const storedHash = localStorage.getItem(`${STORAGE_PREFIX}hash`);
  const storedSalt = localStorage.getItem(`${STORAGE_PREFIX}salt`);

  if (username.toLowerCase() !== storedUser.toLowerCase()) {
    throw new Error('Invalid username or password');
  }

  if (storedHash && storedSalt) {
    const valid = await verifyPasswordWeb(password, storedSalt, storedHash);
    if (!valid) throw new Error('Invalid username or password');
  } else {
    // Check against default password
    if (password !== DEFAULT_PASSWORD) {
      throw new Error('Invalid username or password');
    }
  }

  // Create a client session token
  const token = 'static_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
  return { token, username: storedUser };
}

export async function changePasswordLocal(currentPassword: string, newPassword: string): Promise<void> {
  const storedSalt = localStorage.getItem(`${STORAGE_PREFIX}salt`);
  const storedHash = localStorage.getItem(`${STORAGE_PREFIX}hash`);

  if (storedSalt && storedHash) {
    const valid = await verifyPasswordWeb(currentPassword, storedSalt, storedHash);
    if (!valid) throw new Error('Current password is incorrect');
  } else {
    if (currentPassword !== DEFAULT_PASSWORD) {
      throw new Error('Current password is incorrect');
    }
  }

  const { hash, salt } = await hashPasswordWeb(newPassword);
  localStorage.setItem(`${STORAGE_PREFIX}hash`, hash);
  localStorage.setItem(`${STORAGE_PREFIX}salt`, salt);
}
