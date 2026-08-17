import DOMPurify from 'dompurify'

/**
 * 🛡️ XSS Prevention Utilities
 *
 * Tüm user-generated content'i sanitize eder
 * HTML injection ve script execution saldırılarını engeller
 */

// DOMPurify yapılandırması
const purifyConfig = {
  ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
  ALLOWED_ATTR: ['href', 'title', 'target'],
  ALLOW_DATA_ATTR: false,
  // ✅ Script ve event handler'ları engelle
  FORBID_TAGS: ['script', 'iframe', 'img', 'video', 'object', 'embed', 'form', 'input'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onmouseout', 'onchange', 'onsubmit'],
}

/**
 * HTML içeriği sanitize et
 * @param {string} html - Temizlenecek HTML
 * @returns {string} Temiz HTML
 */
export const sanitizeHtml = (html) => {
  if (!html || typeof html !== 'string') return ''
  return DOMPurify.sanitize(html, purifyConfig)
}

/**
 * Metin içeriği sanitize et (HTML special char'ları escape et)
 * @param {string} text - Temizlenecek metin
 * @returns {string} Temiz metin
 */
export const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') return ''

  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * URL'yi sanitize et (javascript: ve data: protocol'lerini engelle)
 * @param {string} url - Kontrol edilecek URL
 * @returns {string} Güvenli URL veya empty string
 */
export const sanitizeUrl = (url) => {
  if (!url || typeof url !== 'string') return ''

  // Güvensiz protokolleri engelle
  const unsafeProtocols = ['javascript:', 'data:', 'vbscript:', 'file:']
  const lowerUrl = url.toLowerCase().trim()

  if (unsafeProtocols.some(proto => lowerUrl.startsWith(proto))) {
    return ''
  }

  return url
}

/**
 * Object'i sanitize et (tüm string property'lerini clean et)
 * @param {object} obj - Sanitize edilecek object
 * @returns {object} Sanitized object
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') return obj

  const sanitized = {}

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeText(value)
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value)
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Markdown içeriği güvenli şekilde render et (react-markdown için)
 * rehype-sanitize plugin'i kullan
 */
export const getMarkdownConfig = () => ({
  // react-markdown components şu şekilde yapılandırılmalı
  allowedElements: ['p', 'br', 'strong', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'a', 'ul', 'ol', 'li'],
  allowedAttributes: {
    a: ['href', 'title'],
  },
})

export default {
  sanitizeHtml,
  sanitizeText,
  sanitizeUrl,
  sanitizeObject,
  getMarkdownConfig,
}
