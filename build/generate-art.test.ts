import { describe, it, expect } from 'vitest';
import { diagnoseGenerationError } from './generate-art.js';

describe('diagnoseGenerationError', () => {
  it('detects gated repo / auth errors', () => {
    const stderr = `huggingface_hub.errors.GatedRepoError: 401 Client Error.
Cannot access gated repo for url https://huggingface.co/black-forest-labs/FLUX.1-dev/resolve/abc/text_encoder/config.json.
Access to model black-forest-labs/FLUX.1-dev is restricted. You must have access to it and be authenticated to access it.`;

    const msg = diagnoseGenerationError(stderr);
    expect(msg).toContain('FLUX.1-dev');
    expect(msg).toContain('hf login');
  });

  it('detects generic 401 Unauthorized', () => {
    const stderr = `httpx.HTTPStatusError: Client error '401 Unauthorized' for url 'https://huggingface.co/some-model/resolve/abc/config.json'`;

    const msg = diagnoseGenerationError(stderr);
    expect(msg).toContain('hf login');
  });

  it('detects incomplete HF cache / network errors', () => {
    const stderr = `httpx.RemoteProtocolError: Server disconnected without sending a response.
FileNotFoundError: Incomplete Hugging Face tokenizer cache for 'black-forest-labs/FLUX.1-dev'. No usable tokenizer files were found in 'tokenizer_2'. Re-run with network access or clear/redownload the cache.`;

    const msg = diagnoseGenerationError(stderr);
    expect(msg).toContain('cache');
    expect(msg).toContain('FLUX.1-dev');
  });

  it('returns null for unrelated errors', () => {
    const stderr = 'RuntimeError: MPS backend out of memory';
    expect(diagnoseGenerationError(stderr)).toBeNull();
  });
});
