/**
 * Classify a rendered chapter's narratable text by speaking role.
 *
 * Drives the same walker as injectWordFragments, so the concatenation of
 * the returned segments is identical to its narratableText by
 * construction — the invariant that keeps whole-chapter boundary offsets
 * valid across voice switches. The orchestrator still asserts it at
 * runtime (fail loudly beats trust).
 */
import { walkNarratableHtml, decodeEntities } from './word-fragments.js';
import type { NarrationRole } from './voices.js';

export interface VoiceSegment {
  role: NarrationRole;
  text: string;
  /** UTF-16 offsets into the chapter narratable text, [charStart, charEnd). */
  charStart: number;
  charEnd: number;
}

const CONVERSATION_ATTR = /\bdata-conversation="(prompt|agent)"/;
const JEEVES_LABEL = 'My Man Jeeves:';

type JeevesPhase =
  | 'idle'          // not in a candidate paragraph
  | 'p-start'       // <p> just opened, nothing but whitespace seen
  | 'in-label'      // inside the opening <strong>
  | 'label-matched' // label verified; waiting for the <em>
  | 'in-em';        // inside the Jeeves <em> body

export function segmentVoices(html: string): VoiceSegment[] {
  const segments: VoiceSegment[] = [];
  let narratableLength = 0;

  // Conversation state: role + open-div depth (1 = the conversation div).
  let convoRole: NarrationRole | null = null;
  let convoDepth = 0;

  // Jeeves state machine (only active outside conversation divs).
  let phase: JeevesPhase = 'idle';
  let labelBuffer = '';
  let emDepth = 0;

  const currentRole = (): NarrationRole =>
    convoRole ?? (phase === 'in-em' ? 'jeeves' : 'narrator');

  const push = (text: string, role: NarrationRole) => {
    if (!text) return;
    const last = segments[segments.length - 1];
    if (last && last.role === role) {
      last.text += text;
      last.charEnd += text.length;
    } else {
      segments.push({
        role,
        text,
        charStart: narratableLength,
        charEnd: narratableLength + text.length,
      });
    }
    narratableLength += text.length;
  };

  walkNarratableHtml(html, {
    onText(raw) {
      const decoded = decodeEntities(raw);
      if (phase === 'in-label') {
        labelBuffer += decoded;
        push(decoded, currentRole()); // the label itself is narrated by the narrator
        return;
      }
      if ((phase === 'p-start' || phase === 'label-matched') && decoded.trim() !== '') {
        // Unexpected prose where only whitespace may appear — not a Jeeves shape.
        phase = 'idle';
      }
      push(decoded, currentRole());
    },
    onSuppressedText() {
      // Navigation chrome (doc-backlinks): not narrated, no offset advance.
    },
    onTag(tag, name, suppressed) {
      if (suppressed) return;
      const isClose = tag.startsWith('</');
      const isSelfClose = tag.endsWith('/>');

      if (name === 'div') {
        if (convoRole) {
          if (isClose) {
            if (--convoDepth === 0) convoRole = null;
          } else if (!isSelfClose) {
            convoDepth++;
          }
        } else if (!isClose && !isSelfClose) {
          const m = CONVERSATION_ATTR.exec(tag);
          if (m) {
            convoRole = m[1] as NarrationRole;
            convoDepth = 1;
            phase = 'idle'; // jeeves detection is off inside conversations
          }
        }
        return;
      }
      if (convoRole) return; // inside a conversation, only div tracking matters

      switch (name) {
        case 'p':
          if (isClose) { phase = 'idle'; emDepth = 0; }
          else { phase = 'p-start'; labelBuffer = ''; }
          break;
        case 'strong':
          if (!isClose && phase === 'p-start') { phase = 'in-label'; labelBuffer = ''; }
          else if (isClose && phase === 'in-label') {
            phase = labelBuffer.trim() === JEEVES_LABEL ? 'label-matched' : 'idle';
          }
          break;
        case 'em':
          if (!isClose && phase === 'label-matched') { phase = 'in-em'; emDepth = 1; }
          else if (phase === 'in-em') {
            if (isClose) { if (--emDepth === 0) phase = 'idle'; }
            else if (!isSelfClose) emDepth++;
          }
          break;
        default:
          // Any other element at p-start (e.g. a leading <span>) breaks the shape.
          if (phase === 'p-start' && !isClose) phase = 'idle';
      }
    },
  });

  return segments;
}
