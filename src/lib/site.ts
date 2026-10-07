import { joinBase, normalizeBase } from './urls.mjs';
export const base = normalizeBase(import.meta.env.BASE_URL);
export const withBase = (path = ''): string => joinBase(path, base);

export function endpoint(value: string | undefined): string {
  if (!value?.trim()) return '';
  const url = new URL(value.trim());
  if (url.protocol !== 'https:' || url.username || url.password || url.hash) throw new Error('Public service endpoints must use HTTPS and contain no credentials.');
  return url.href;
}
export const contactEndpoint = endpoint(import.meta.env.PUBLIC_CONTACT_ENDPOINT);
export const analyticsEndpoint = endpoint(import.meta.env.PUBLIC_ANALYTICS_ENDPOINT);
export const contactEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(import.meta.env.PUBLIC_CONTACT_EMAIL || '') ? import.meta.env.PUBLIC_CONTACT_EMAIL : '';
export const ownerName = (import.meta.env.PUBLIC_OWNER_NAME || '').trim();
export const ownerBio = (import.meta.env.PUBLIC_OWNER_BIO || '').trim();
export const inquiryLabel = contactEndpoint || contactEmail ? 'Start a project' : 'Prepare a project brief';
