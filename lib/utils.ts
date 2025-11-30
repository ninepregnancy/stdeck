import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSessionId(): string {
  let sessionId = localStorage.getItem('startupdeck_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('startupdeck_session_id', sessionId);
  }
  return sessionId;
}

export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    let hostname = urlObj.hostname.toLowerCase();
    if (hostname.startsWith('www.')) hostname = hostname.slice(4);
    return `${hostname}${urlObj.pathname.replace(/\/$/, '')}`;
  } catch (e) {
    return url;
  }
}

// Simple client-side hashing simulation for demo purposes
export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateId(): string {
  return crypto.randomUUID();
}
