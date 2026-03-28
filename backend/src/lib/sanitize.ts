import sanitizeHtml from 'sanitize-html'

/**
 * Strip all HTML tags from user input to prevent stored XSS.
 * Allows only plain text — no tags, no attributes.
 */
export function sanitizeText(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim()
}
