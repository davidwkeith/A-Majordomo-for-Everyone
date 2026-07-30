import { describe, it, expect } from 'vitest';
import { VOICE_MAP, serializeVoiceMap } from './voices.js';

describe('VOICE_MAP', () => {
  it('pins the four roles to identifiers, not display names', () => {
    expect(VOICE_MAP.narrator.identifier).toBe('com.apple.voice.enhanced.en-US.Nathan');
    expect(VOICE_MAP.prompt.identifier).toBe('com.apple.voice.enhanced.en-US.Nathan');
    expect(VOICE_MAP.agent.identifier).toBe('com.apple.voice.enhanced.en-US.Nathan');
    // Renamed-voice gotcha: Jamie (Premium) kept Malcolm's identifier.
    expect(VOICE_MAP.jeeves.identifier).toBe('com.apple.voice.premium.en-GB.Malcolm');
  });
});

describe('serializeVoiceMap', () => {
  it('is deterministic regardless of key insertion order', () => {
    const a = { narrator: { identifier: 'x', displayName: 'X' }, jeeves: { identifier: 'y', displayName: 'Y' } };
    const b = { jeeves: { identifier: 'y', displayName: 'Y' }, narrator: { identifier: 'x', displayName: 'X' } };
    expect(serializeVoiceMap(a as never)).toBe(serializeVoiceMap(b as never));
  });

  it('changes when any identifier changes', () => {
    const base = serializeVoiceMap();
    const swapped = serializeVoiceMap({
      ...VOICE_MAP,
      agent: { identifier: 'com.apple.voice.premium.en-US.Zoe', displayName: 'Zoe (Premium)' },
    });
    expect(swapped).not.toBe(base);
  });
});
