---
format: png
size: margin
alt: >
  A vintage radio tuning dial with the needle centered precisely on a station mark.
---

A vintage radio tuning dial in 8-bit pixel art, approximately 48x36
pixels scaled up. A horizontal dial window with tick marks and
frequency numbers too small to read as digits (rendered as short flat
color bars, not legible text), and a single thin needle pointer
centered exactly on one tick mark --- precision, not ambiguity, is
the point of the image. Palette: Recycled for the dial face, Black
for tick marks and needle, Red for the single tuned-station mark the
needle points to, Charcoal for the dial's outer casing edge. Colored
in ballpoint pen and pencil per the inline-graphics style.

**True pixel grid --- non-negotiable.** Actual 8-bit pixel art, not a
blocky illustration. Render on a literal uniform grid of axis-aligned
square pixels, as if captured from an NES framebuffer and enlarged
with nearest-neighbor scaling. Every pixel the same size, hard edges
between colors, no anti-aliasing, no smooth curves, no sub-pixel
detail. The viewer should be able to count pixels along an edge.

**No meta-elements --- non-negotiable.** Only the dial. No color
swatches, palettes, legends, keys, hex codes, callouts, arrows
pointing at the needle, sidebar text, or any UI explaining the colors
or technique. No caption text inside the image.

**Background: pure white, `#FFFFFF`, flat.** Not gray, not off-white,
not cream, not paper texture. The build removes white to create
transparency, so any gray will show as a halo in the ePub.

**Watch out for:**

- NO readable frequency numbers --- tick marks only, this is not a
  labeled diagram
- NO hand or figure turning the dial --- object-focused
- NO full radio body/speaker, just the dial window and its immediate
  casing edge
- NO speech bubble, thought bubble, or dialogue text
