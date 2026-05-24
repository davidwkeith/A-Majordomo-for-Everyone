import { describe, it, expect } from 'vitest';
import { parseUuid } from './uuid-parse.js';

describe('parseUuid', () => {
  it('extracts the UUID from a well-formed comment', () => {
    const body = '> quoted passage\n\nmy note\n\n<!-- apple-books-uuid: 4F3A-AB12-B891 -->\n';
    expect(parseUuid(body)).toBe('4F3A-AB12-B891');
  });

  it('returns null when no comment is present', () => {
    expect(parseUuid('plain body, no marker')).toBeNull();
  });

  it('returns null on malformed comment (missing prefix)', () => {
    expect(parseUuid('<!-- some-other-uuid: ABC123 -->')).toBeNull();
  });

  it('tolerates surrounding whitespace inside the comment', () => {
    expect(parseUuid('<!--  apple-books-uuid:   ABC-123  -->')).toBe('ABC-123');
  });

  it('returns the first UUID if the body contains two (defensive)', () => {
    const body = '<!-- apple-books-uuid: FIRST -->\n<!-- apple-books-uuid: SECOND -->';
    expect(parseUuid(body)).toBe('FIRST');
  });

  it('handles real-world Apple Books UUID format (long hex with dashes)', () => {
    const body = '<!-- apple-books-uuid: 4F3A2B1C-9D8E-7F6A-5B4C-3D2E1F0A9B8C -->';
    expect(parseUuid(body)).toBe('4F3A2B1C-9D8E-7F6A-5B4C-3D2E1F0A9B8C');
  });
});
