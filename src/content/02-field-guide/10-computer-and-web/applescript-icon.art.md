---
format: png
size: margin
alt: >
  The original AppleScript icon — a paper scroll, slightly curled at top and bottom — rendered in 8-bit pixel art on a Mac System 7 desktop tile
---

The original AppleScript icon from the early 90s, rendered in 8-bit
pixel art as it would appear at 32x32 on a Mac System 7 desktop. The
icon: a **paper scroll**, slightly curled at the top and bottom,
shown straight-on. Light cream/Recycled paper with darker
Charcoal/Black outline pixels, a few internal pixel marks suggesting
horizontal lines of text without actually spelling words. Constraints
of an 8-bit icon apply --- pixel-stepped curls at top and bottom, no
smooth gradient, just two or three flat tones from the master palette.

**Mac System 7 framing:** The icon sits on a small white square the
same width as the icon plus a one-pixel border, with a two-pixel
charcoal drop shadow offset down and right --- the unmistakable
System 7 desktop icon presentation. The square sits alone on a pure
white background. No filename label, no surrounding desktop, no
menu bar, no other icons.

**Palette (from the master palette):** Recycled for the scroll body,
Charcoal and Black for the outline and shading pixels, Brown
optionally for the curl shadow. No more than four colors total.

**True pixel grid --- non-negotiable.** This is actual 8-bit pixel
art at ~32x32 enlarged with nearest-neighbor scaling, not a 3D
render and not a blocky illustration. Every pixel the same size.
Hard edges between colors, no anti-aliasing, no smooth curves --- the
scroll's curls are stair-stepped pixel arcs. The viewer should be
able to count individual pixels along any edge.

**No meta-elements --- non-negotiable.** No "AppleScript" wordmark
inside the image, no caption, no version number, no Apple logo, no
color swatches, no hex codes, no UI chrome beyond the System 7 icon
tile itself.

**Background: pure white, `#FFFFFF`, flat.** Not gray, not off-white,
not cream, not paper texture, not a notebook page, not a desktop
pattern. The build removes white to create transparency, so any gray
will show as a halo in the ePub.

**Watch out for:**

- NO modern macOS scroll-icon glyph (the colorful gradient scroll
  from later OS X) --- this is the flat early-90s System 7 style
- NO Automator robot, no Script Editor app icon
- NO readable text on the scroll --- only suggestion-of-text pixel
  marks
