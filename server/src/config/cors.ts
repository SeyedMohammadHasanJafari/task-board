import { ENV } from './env.js';

export function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true;

  const normalized = origin.trim().replace(/\/$/, '');
  const configuredOrigins = ENV.CLIENT_URL.split(',').map((u) => u.trim().replace(/\/$/, ''));

  if (configuredOrigins.includes(normalized)) return true;
  if (normalized.includes('localhost') || normalized.includes('127.0.0.1')) return true;
  if (normalized.endsWith('.vercel.app')) return true;

  return false;
}
