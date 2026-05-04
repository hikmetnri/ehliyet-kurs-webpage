/**
 * Resolves a media asset path to a full URL.
 *
 * - In development: relative paths are forwarded by the Vite dev proxy to localhost:3000
 * - In production:  VITE_MEDIA_BASE (e.g. https://api.ehliyetyolu.com) is prepended
 *
 * Supported formats stored in DB:
 *   /uploads/...                    → uploaded files
 *   assets/images/signs/Cat/x.png  → Flutter traffic sign assets
 *   assets/images/...              → other Flutter image assets
 *   assets/content/...             → Flutter lesson content images
 *   http://...                      → already absolute, returned as-is
 */
// Sadece production build alındığında (veya PROD modunda) VITE_MEDIA_BASE kullanılır.
// Geliştirme (dev) ortamında boş kalır, böylece Vite proxy istekleri backend'e iletir.
const MEDIA_BASE = import.meta.env.PROD ? (import.meta.env.VITE_MEDIA_BASE || '') : '';

export const resolveMediaUrl = (src) => {
  if (!src) return src;
  if (src.startsWith('http')) return src;                          // already absolute

  if (src.startsWith('/uploads/')) return `${MEDIA_BASE}${src}`;  // uploaded files

  if (src.startsWith('assets/images/signs/')) {
    const signPath = src.replace('assets/images/signs/', '');
    return `${MEDIA_BASE}/signs/${signPath}`;
  }

  if (src.startsWith('assets/images/')) {
    const assetPath = src.replace('assets/images/', '');
    return `${MEDIA_BASE}/images/${assetPath}`;
  }

  if (src.startsWith('assets/content/')) {
    const contentPath = src.replace('assets/content/', '');
    return `${MEDIA_BASE}/content/${contentPath}`;
  }

  if (src.startsWith('assets/')) {
    return `${MEDIA_BASE}/images/${src.replace('assets/', '')}`;
  }

  return `${MEDIA_BASE}/${src}`;
};
