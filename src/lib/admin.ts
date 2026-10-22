// Admin password gate for the "Join Server" / server info panel.
//
// The site is static (no backend), so the check happens in the browser. Only a salted
// PBKDF2 hash of the password is stored in the code, never the password itself.
// This keeps casual visitors out; it is not strong security, so use a long password.

import { ADMIN_PASSWORD_HASH, ADMIN_PASSWORD_SALT, ADMIN_PASSWORD_ITERATIONS } from '../config';

const STORAGE_KEY = 'wmsmp_admin_unlock';

export const adminPasswordConfigured = () => ADMIN_PASSWORD_HASH.length === 64;

async function hashPassword(password: string): Promise<string> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: new TextEncoder().encode(ADMIN_PASSWORD_SALT), iterations: ADMIN_PASSWORD_ITERATIONS },
    material,
    256,
  );
  return Array.from(new Uint8Array(bits), (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function checkAdminPassword(password: string): Promise<boolean> {
  if (!adminPasswordConfigured() || !password) return false;
  const ok = (await hashPassword(password)) === ADMIN_PASSWORD_HASH;
  if (ok) {
    try {
      // Remember this browser (tied to the current hash, so changing the password locks everyone out again).
      localStorage.setItem(STORAGE_KEY, ADMIN_PASSWORD_HASH);
    } catch {
      // ignore
    }
  }
  return ok;
}

export function isAdminUnlocked(): boolean {
  try {
    return adminPasswordConfigured() && localStorage.getItem(STORAGE_KEY) === ADMIN_PASSWORD_HASH;
  } catch {
    return false;
  }
}

export function lockAdmin() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
