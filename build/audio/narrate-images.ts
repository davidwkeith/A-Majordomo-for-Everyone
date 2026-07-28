/**
 * Illustration announcements for the read-along audiobook edition.
 *
 * An image's `alt` text is invisible to `injectWordFragments` — it lives in
 * an attribute, not a text node, so nothing narrates it. This inserts a
 * real (but visually hidden, `.narration-only` in base.css) text node right
 * after each `<img>`, so the illustration gets called out and its alt text
 * read when `injectWordFragments` runs afterward and picks it up like any
 * other prose.
 *
 * ePub-only, like `injectWordFragments` — wire this into `build/index.ts`'s
 * ePub-specific chapter transform, not the shared `processContent` pipeline
 * the site/PDF builds also use.
 *
 * Placeholder figures (missing art, see `build/filters/art-briefs.ts`)
 * already render their alt text visibly in a `<summary>`, so they need no
 * special handling here — only real `<img>` tags hide their alt text in an
 * attribute.
 */

const IMG_PATTERN = /<img\s[^>]*\balt="([^"]*)"[^>]*\/?>/g;

export function announceIllustrations(html: string): string {
  return html.replace(IMG_PATTERN, (tag, alt: string) => {
    // Decorative images (empty alt) are intentionally not described to
    // assistive tech, so they shouldn't be narrated either.
    if (!alt.trim()) return tag;
    // Alt text is written as a complete sentence (see spec/illustration/) —
    // no punctuation added here so it doesn't risk a doubled trailing period.
    return `${tag}<span class="narration-only" aria-hidden="true">Illustration. ${alt}</span>`;
  });
}
