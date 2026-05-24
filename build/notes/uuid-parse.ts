/**
 * Extract the Apple Books UUID from a GitHub Issue body.
 */

const UUID_RE = /<!--\s*apple-books-uuid:\s*([^\s][^\s-]*(?:-[^\s-]+)*)\s*-->/;

export function parseUuid(body: string): string | null {
  const m = body.match(UUID_RE);
  return m ? m[1] : null;
}
