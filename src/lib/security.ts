import DOMPurify from 'isomorphic-dompurify';
import logger from './logger';

/**
 * Sanitizes input by stripping all HTML tags and attributes.
 * Suitable for standard text fields to prevent XSS.
 * @param input - The string to sanitize
 * @returns Sanitized string with all HTML removed
 */
export function sanitize(input: string): string {
  if (typeof input !== 'string') {
    logger.warn('sanitize: Input is not a string, returning empty string');
    return '';
  }

  const sanitized = DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
  if (sanitized !== input) {
    logger.info(`sanitize: Malicious content detected and neutralized: "${input}" -> "${sanitized}"`);
  }
  return sanitized;
}

/**
 * Sanitizes HTML input, allowing only safe tags for rich-text inputs.
 * Allows tags like <p>, <b>, <i>, <ul>, <li> to support basic formatting.
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML with only safe tags
 */
export function sanitizeHTML(html: string): string {
  if (typeof html !== 'string') {
    logger.warn('sanitizeHTML: Input is not a string, returning empty string');
    return '';
  }

  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'strong', 'em', 'ul', 'li', 'br'],
    ALLOWED_ATTR: []
  });

  if (sanitized !== html) {
    logger.info(`sanitizeHTML: Malicious content detected and neutralized: "${html}" -> "${sanitized}"`);
  }
  return sanitized;
}
