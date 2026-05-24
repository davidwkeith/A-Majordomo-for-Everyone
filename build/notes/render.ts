/**
 * Pure transformation: Apple Books annotation → GitHub issue body.
 */

import type { Annotation, RenderedIssue } from './types.js';
import { GITHUB_BODY_MAX, NSDATE_EPOCH_OFFSET } from './types.js';

const TRUNCATED_SUFFIX = '\n\n_[truncated]_\n';

export function nsdateToDate(nsdateSeconds: number): Date {
  return new Date((nsdateSeconds + NSDATE_EPOCH_OFFSET) * 1000);
}

export function deriveTitle(note: string): string {
  const firstNonEmpty = note
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0);

  if (!firstNonEmpty) return '(empty note)';

  const stripped = firstNonEmpty.replace(/^(#+|[-*+]|>)\s+/, '').trim();
  const collapsed = stripped.replace(/\s+/g, ' ');

  if (collapsed.length <= 80) return collapsed;
  return collapsed.slice(0, 79) + '…';
}

function quoteLines(text: string): string {
  return text
    .split('\n')
    .map((l) => `> ${l}`)
    .join('\n');
}

function locationLabel(percent: number): string {
  return `${Math.round(percent * 100)}%`;
}

export function render(ann: Annotation): RenderedIssue {
  const title = deriveTitle(ann.note);
  const chapter = ann.chapterTitle ?? 'Uncategorized';

  const body =
    quoteLines(ann.selectedText) +
    `\n>\n> — ${chapter} (${locationLabel(ann.locationPercent)})\n\n` +
    ann.note +
    `\n\n<!-- apple-books-uuid: ${ann.uuid} -->\n` +
    `<!-- apple-books-modified: ${ann.modifiedAt.toISOString()} -->\n`;

  if (body.length <= GITHUB_BODY_MAX) {
    return { title, body };
  }

  const footer =
    `\n\n<!-- apple-books-uuid: ${ann.uuid} -->\n` +
    `<!-- apple-books-modified: ${ann.modifiedAt.toISOString()} -->\n`;
  const budget = GITHUB_BODY_MAX - TRUNCATED_SUFFIX.length - footer.length;
  const truncated = body.slice(0, budget) + TRUNCATED_SUFFIX + footer;
  return { title, body: truncated };
}
