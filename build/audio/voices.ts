/**
 * Role→voice assignments for the read-along audiobook.
 *
 * Voices are pinned by AVSpeech *identifier*, never display name: display
 * names are localized and mutable — "Jamie (Premium)" below carries the
 * identifier `...en-GB.Malcolm` because Apple renamed the voice but kept
 * its identifier. Changing any assignment invalidates every chapter's
 * narration cache entry (the serialized map is part of the cache key).
 *
 * v1 deliberately reads prompt/agent blocks in the narrator voice — the
 * roles are segmented anyway so enabling distinct voices later is a
 * config change plus re-synthesis. See the 2026-07-30 design spec.
 */

export type NarrationRole = 'narrator' | 'prompt' | 'agent' | 'jeeves';

export interface VoiceAssignment {
  identifier: string;
  displayName: string;
}

const NATHAN: VoiceAssignment = {
  identifier: 'com.apple.voice.enhanced.en-US.Nathan',
  displayName: 'Nathan (Enhanced)',
};

export const VOICE_MAP: Record<NarrationRole, VoiceAssignment> = {
  narrator: NATHAN,
  prompt: NATHAN,
  agent: NATHAN,
  jeeves: {
    identifier: 'com.apple.voice.premium.en-GB.Malcolm',
    displayName: 'Jamie (Premium)',
  },
};

/** Deterministic serialization for the narration cache key. */
export function serializeVoiceMap(map: Record<NarrationRole, VoiceAssignment> = VOICE_MAP): string {
  const roles = Object.keys(map).sort() as NarrationRole[];
  return JSON.stringify(roles.map((role) => [role, map[role].identifier]));
}
