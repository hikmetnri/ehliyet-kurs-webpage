/**
 * Resolves a media asset path to a full URL.
 *
 * - Uploaded files are served from the API/media host.
 * - Bundled Flutter assets copied into public/ are served by the web app itself.
 *
 * Supported formats stored in DB:
 *   /uploads/...                    → uploaded files
 *   assets/images/signs/Cat/x.png  → Flutter traffic sign assets
 *   assets/images/...              → other Flutter image assets
 *   assets/content/...             → Flutter lesson content images
 *   http://...                      → already absolute, returned as-is
 */
const MEDIA_BASE = (import.meta.env.VITE_MEDIA_BASE || '').replace(/\/$/, '');
const CLOUDINARY_MEDIA_BASE = (
  import.meta.env.VITE_CLOUDINARY_MEDIA_BASE ||
  'https://res.cloudinary.com/drysbbsd1/image/upload/f_auto,q_auto'
).replace(/\/$/, '');

const IMAGE_FILE_RE = /\.(png|jpe?g|webp|gif|svg|avif)(\?.*)?$/i;

const localPublicUrl = (path) => `/${path.replace(/^\/+/, '').normalize('NFC')}`;

export const resolveMediaUrl = (src) => {
  if (!src) return src;
  const value = src.trim().normalize('NFC');
  if (!value) return value;
  if (value.startsWith('http')) return value;                       // already absolute
  if (value.startsWith('//')) return `https:${value}`;

  const assetPath = value.replace(/^\/+/, '');

  if (assetPath.startsWith('uploads/')) return `${MEDIA_BASE}/${assetPath}`;  // uploaded files

  if (assetPath.startsWith('assets/images/signs/')) {
    const signPath = assetPath.replace('assets/images/signs/', '');
    return `${CLOUDINARY_MEDIA_BASE}/trafik-levhalari/${signPath}`;
  }

  if (assetPath.startsWith('images/signs/')) {
    const signPath = assetPath.replace('images/signs/', '');
    return `${CLOUDINARY_MEDIA_BASE}/trafik-levhalari/${signPath}`;
  }

  if (assetPath.startsWith('signs/')) {
    const signPath = assetPath.replace('signs/', '');
    return `${CLOUDINARY_MEDIA_BASE}/trafik-levhalari/${signPath}`;
  }

  if (assetPath.startsWith('trafik-levhalari/') || assetPath.startsWith('isg/')) {
    return `${CLOUDINARY_MEDIA_BASE}/${assetPath}`;
  }

  if (assetPath.startsWith('assets/content/')) {
    const contentPath = assetPath
      .replace('assets/content/', '')
      .replace('ekonomik_suruş.png', 'ekonomik_surus.png');
    return `${CLOUDINARY_MEDIA_BASE}/content/${contentPath}`;
  }

  if (assetPath.startsWith('content/')) {
    const contentPath = assetPath
      .replace('content/', '')
      .replace('ekonomik_suruş.png', 'ekonomik_surus.png');
    return `${CLOUDINARY_MEDIA_BASE}/content/${contentPath}`;
  }

  if (!assetPath.includes('/') && IMAGE_FILE_RE.test(assetPath)) {
    return localPublicUrl(`content/${assetPath}`);
  }

  if (assetPath.startsWith('assets/images/')) {
    const imagePath = assetPath.replace('assets/images/', '');
    return `${MEDIA_BASE}/images/${imagePath}`;
  }

  if (assetPath.startsWith('assets/')) {
    return `${MEDIA_BASE}/images/${assetPath.replace('assets/', '')}`;
  }

  return `${MEDIA_BASE}/${assetPath}`;
};
