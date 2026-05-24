/**
 * Pure reconciliation: given current annotations and existing
 * auto-filed issues, compute the action list.
 */

import type { Action, Annotation, IssueRecord } from './types.js';
import { render } from './render.js';
import { parseUuid } from './uuid-parse.js';

export function reconcile(
  annotations: readonly Annotation[],
  existing: readonly IssueRecord[]
): Action[] {
  // Defensive: if sqlite somehow returns two rows with the same UUID,
  // process only the first occurrence (spec failure-mode table).
  const seen = new Set<string>();
  const uniqueAnnotations: Annotation[] = [];
  for (const ann of annotations) {
    if (seen.has(ann.uuid)) continue;
    seen.add(ann.uuid);
    uniqueAnnotations.push(ann);
  }

  const byUuid = new Map<string, IssueRecord>();
  for (const issue of existing) {
    const uuid = parseUuid(issue.body);
    if (uuid !== null) byUuid.set(uuid, issue);
  }

  const actions: Action[] = [];
  for (const ann of uniqueAnnotations) {
    const rendered = render(ann);
    const found = byUuid.get(ann.uuid);
    if (!found) {
      actions.push({ type: 'create', uuid: ann.uuid, rendered });
    } else if (found.body === rendered.body) {
      actions.push({ type: 'noop', uuid: ann.uuid, issue: found.number });
    } else {
      actions.push({ type: 'update', uuid: ann.uuid, issue: found.number, rendered });
    }
  }
  return actions;
}
