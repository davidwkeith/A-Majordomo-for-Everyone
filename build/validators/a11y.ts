import type { BookMeta, ProcessedChapter } from '../types.js';
import type { ArtBriefContext } from '../filters/art-briefs.js';

export interface A11yIssue {
  feature: string;
  message: string;
  source?: string;
}

/**
 * The accessibility features declared in the ePub OPF. Every feature listed
 * here must be satisfied by the content, or the build fails. Declaring WCAG
 * compliance we don't actually meet is worse than making no claim.
 */
export const DECLARED_A11Y_FEATURES = [
  'structuralNavigation',
  'tableOfContents',
  'readingOrder',
  'alternativeText',
  'longDescription',
] as const;

// Whitespace before `alt` distinguishes the real attribute from `data-alt`,
// `srcset-alt`, etc. Both quote styles are accepted, with optional whitespace
// around `=` and inside the quotes.
const IMG_NO_ALT = /<img\b(?![^>]*\s+alt\s*=)[^>]*>/gi;
const IMG_EMPTY_ALT = /<img\b[^>]*\s+alt\s*=\s*(['"])\s*\1/gi;

function snippet(tag: string): string {
  const flat = tag.replace(/\s+/g, ' ').trim();
  return flat.length > 80 ? flat.slice(0, 77) + '...' : flat;
}

export function validateAccessibility(
  meta: BookMeta,
  chapters: ProcessedChapter[],
  artCtx: ArtBriefContext
): A11yIssue[] {
  const issues: A11yIssue[] = [];

  // tableOfContents: nav.xhtml is generated from this list, so every entry
  // must have a title for screen-reader navigation.
  if (chapters.length === 0) {
    issues.push({
      feature: 'tableOfContents',
      message: 'no chapters found — navigation would be empty',
    });
  }
  for (const ch of chapters) {
    if (!ch.meta.title.trim()) {
      issues.push({
        feature: 'tableOfContents',
        message: 'chapter missing title',
        source: ch.meta.sourceFile,
      });
    }
  }

  // readingOrder: the spine is sorted by (part, order); duplicates produce
  // an ambiguous ordering, and duplicate slugs collide in the manifest.
  const seenOrder = new Map<string, string>();
  const seenSlug = new Map<string, string>();
  for (const ch of chapters) {
    const key = `${ch.meta.part}:${ch.meta.order}`;
    const prior = seenOrder.get(key);
    if (prior) {
      issues.push({
        feature: 'readingOrder',
        message: `duplicate (part ${ch.meta.part}, order ${ch.meta.order}); also in ${prior}`,
        source: ch.meta.sourceFile,
      });
    } else {
      seenOrder.set(key, ch.meta.sourceFile);
    }
    const priorSlug = seenSlug.get(ch.meta.slug);
    if (priorSlug) {
      issues.push({
        feature: 'readingOrder',
        message: `duplicate slug "${ch.meta.slug}"; also in ${priorSlug}`,
        source: ch.meta.sourceFile,
      });
    } else {
      seenSlug.set(ch.meta.slug, ch.meta.sourceFile);
    }
  }

  // structuralNavigation: the book must declare a language so screen readers
  // can pick the right pronunciation engine.
  if (!meta.language.trim()) {
    issues.push({
      feature: 'structuralNavigation',
      message: 'book metadata missing language',
    });
  }

  // alternativeText: every art brief must have alt text (rendered into <img>
  // or into the placeholder's <summary>), and no <img> in chapter HTML may
  // be missing or empty its alt attribute.
  for (const brief of artCtx.briefs.values()) {
    if (!brief.alt.trim()) {
      issues.push({
        feature: 'alternativeText',
        message: 'art brief has empty alt',
        source: brief.sourcePath,
      });
    }
  }
  for (const ch of chapters) {
    for (const m of ch.html.matchAll(IMG_NO_ALT)) {
      issues.push({
        feature: 'alternativeText',
        message: `<img> without alt attribute: ${snippet(m[0])}`,
        source: ch.meta.sourceFile,
      });
    }
    for (const m of ch.html.matchAll(IMG_EMPTY_ALT)) {
      issues.push({
        feature: 'alternativeText',
        message: `<img> with empty alt attribute: ${snippet(m[0])}`,
        source: ch.meta.sourceFile,
      });
    }
  }

  // longDescription: the production brief body is the long-form description
  // that renders inside the placeholder <details> and gives the illustrator
  // (or reader, when images are missing) enough context to understand the
  // figure. An empty body breaks that contract.
  for (const brief of artCtx.briefs.values()) {
    if (!brief.brief.trim()) {
      issues.push({
        feature: 'longDescription',
        message: 'art brief has empty production description',
        source: brief.sourcePath,
      });
    }
  }

  return issues;
}

export function formatA11yIssues(issues: A11yIssue[]): string {
  const byFeature = new Map<string, A11yIssue[]>();
  for (const issue of issues) {
    const list = byFeature.get(issue.feature) ?? [];
    list.push(issue);
    byFeature.set(issue.feature, list);
  }
  const lines: string[] = [];
  for (const [feature, list] of byFeature) {
    lines.push(`  ${feature} (${list.length}):`);
    for (const i of list) {
      lines.push(`    - ${i.message}${i.source ? ` (${i.source})` : ''}`);
    }
  }
  return lines.join('\n');
}
