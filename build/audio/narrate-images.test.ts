import { describe, it, expect } from 'vitest';
import { announceIllustrations } from './narrate-images.js';

describe('announceIllustrations', () => {
  it('inserts a hidden narration span with the alt text right after the image', () => {
    const html = '<figure class="inline-graphic-full"><img src="../images/x.png" alt="A cat wearing a hat."/></figure>';
    const out = announceIllustrations(html);
    expect(out).toContain('<img src="../images/x.png" alt="A cat wearing a hat."/>');
    expect(out).toContain('<span class="narration-only" aria-hidden="true">Illustration. A cat wearing a hat.</span>');
    // The span comes right after the img, before any following markup (e.g. figcaption).
    expect(out.indexOf('narration-only')).toBeGreaterThan(out.indexOf('<img'));
  });

  it('does not narrate a decorative image with empty alt text', () => {
    const html = '<img src="../images/deco.png" alt=""/>';
    expect(announceIllustrations(html)).toBe(html);
  });

  it('handles HTML entities in alt text without decoding or re-escaping them', () => {
    const html = '<img src="../images/x.png" alt="Marks &amp; Spencer, a &lt;fictional&gt; shop."/>';
    const out = announceIllustrations(html);
    expect(out).toContain('Illustration. Marks &amp; Spencer, a &lt;fictional&gt; shop.</span>');
  });

  it('narrates each image independently in a chapter with multiple figures', () => {
    const html =
      '<figure><img src="a.png" alt="First image."/></figure>' +
      '<p>Some text.</p>' +
      '<figure><img src="b.png" alt="Second image."/><figcaption>A caption</figcaption></figure>';
    const out = announceIllustrations(html);
    expect(out).toContain('Illustration. First image.</span>');
    expect(out).toContain('Illustration. Second image.</span>');
    // The second image's narration span comes before its figcaption.
    const secondNarration = out.indexOf('Illustration. Second image.');
    const figcaption = out.indexOf('<figcaption>');
    expect(secondNarration).toBeLessThan(figcaption);
  });

  it('leaves html with no images unchanged', () => {
    const html = '<p>Just some prose, no pictures here.</p>';
    expect(announceIllustrations(html)).toBe(html);
  });
});
