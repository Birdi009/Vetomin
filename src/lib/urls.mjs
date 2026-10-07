/** A root-relative base with exactly one separator on either end. */
export function normalizeBase(base = '/') {
  if (typeof base !== 'string' || /[?#\\]/.test(base) || /^[a-z]+:/i.test(base) || base.startsWith('//')) {
    throw new TypeError('The application base must be a root-relative path.');
  }
  const parts = base.split('/').filter(Boolean);
  if (parts.some(part => part === '.' || part === '..' || /%2f|%5c|%2e/i.test(part))) throw new TypeError('Invalid base path.');
  return parts.length ? `/${parts.join('/')}/` : '/';
}

/** Join an APPLICATION-RELATIVE destination, never a user-supplied external URL. */
export function joinBase(path = '', base = '/') {
  if (typeof path !== 'string' || /^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//') || path.includes('\\')) {
    throw new TypeError('Expected an internal application-relative destination.');
  }
  const clean = path.replace(/^\/+/, '');
  if (clean.split(/[?#]/)[0].split('/').some(part => part === '..' || part === '.' || /%2f|%5c|%2e/i.test(part))) {
    throw new TypeError('Traversal is not an internal destination.');
  }
  return normalizeBase(base) + clean;
}

/** Strip query/hash from canonical paths without duplicating the application base. */
export function canonicalPath(pathname, base = '/') {
  const root = normalizeBase(base);
  let path = pathname.split(/[?#]/)[0];
  if (path === root.slice(0, -1)) return root;
  if (!path.startsWith(root)) path = joinBase(path, root);
  // Astro exposes /404/ while writing the special error document as 404.html.
  if (path === root + '404/' || path === root + '404') return root + '404.html';
  return /\.[a-z0-9]+$/i.test(path) ? path : path.replace(/\/+$/, '') + '/';
}
