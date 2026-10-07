/** Only local paths belong here. External URLs must be explicitly validated by their caller. */
export function withBase(path = '', base: string = import.meta.env.BASE_URL): string {
  if (/^[a-z][a-z\d+.-]*:|^\/\//i.test(path) || path.includes('\\')) throw new Error('Expected a local path');
  const root = `/${base.replace(/^\/+|\/+$/g, '')}/`.replace(/\/{2,}/g, '/');
  const clean = path.replace(/^\/+/, '');
  if (clean.split(/[?#]/)[0].split('/').some(part => part === '..' || part === '.')) throw new Error('Path traversal is not permitted');
  return root + clean;
}
export function publicEndpoint(value: string | undefined): string {
  if (!value) return '';
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : ''; } catch { return ''; }
}
export const navigation = [['Home', ''], ['Work', 'work/'], ['About', 'about/'], ['Journal', 'journal/'], ['Contact', 'contact/']] as const;
