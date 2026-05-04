/** Strips all HTML tags from a string, returning plain text. Used for aria-labels and text previews. */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}
