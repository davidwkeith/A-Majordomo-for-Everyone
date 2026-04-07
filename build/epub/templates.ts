import type { BookMeta, ProcessedChapter } from '../types.js';

export function containerXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
}

export function contentOpf(meta: BookMeta, chapters: ProcessedChapter[], hasCover: boolean): string {
  const manifestItems = chapters
    .map(
      (ch) =>
        `    <item id="${ch.meta.slug}" href="text/${ch.meta.slug}.xhtml" media-type="application/xhtml+xml"/>`
    )
    .join('\n');

  const spineItems = chapters
    .map((ch) => `    <itemref idref="${ch.meta.slug}"/>`)
    .join('\n');

  const coverMeta = hasCover
    ? '\n    <meta name="cover" content="cover-image"/>'
    : '';

  const coverManifest = hasCover
    ? '    <item id="cover" href="text/cover.xhtml" media-type="application/xhtml+xml"/>\n    <item id="cover-image" href="images/cover.png" media-type="image/png" properties="cover-image"/>\n'
    : '';

  const coverSpine = hasCover
    ? '    <itemref idref="cover"/>\n'
    : '';

  const subjectItems = meta.subjects
    .map((s) => `    <dc:subject>${escapeXml(s)}</dc:subject>`)
    .join('\n');

  const contributorItems = meta.contributors
    .map(
      (c) =>
        `    <dc:contributor id="${c.id}">${escapeXml(c.name)}</dc:contributor>\n    <meta refines="#${c.id}" property="role" scheme="marc:relators">${c.role}</meta>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId" xml:lang="${meta.language}" prefix="schema: http://schema.org/ a11y: http://www.idpf.org/epub/vocab/package/a11y/#">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${meta.identifier}</dc:identifier>
    <dc:title>${escapeXml(meta.title)}</dc:title>
    <dc:creator id="creator">${escapeXml(meta.creator)}</dc:creator>
    <meta refines="#creator" property="role" scheme="marc:relators">aut</meta>
${contributorItems}
    <dc:publisher>${escapeXml(meta.publisher)}</dc:publisher>
    <dc:language>${meta.language}</dc:language>
    <dc:rights>${escapeXml(meta.rights)}</dc:rights>
    <dc:description>${escapeXml(meta.subtitle)}</dc:description>
    <dc:date>${meta.date}</dc:date>
${subjectItems}
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}</meta>${coverMeta}
    <meta property="schema:accessMode">textual</meta>
    <meta property="schema:accessMode">visual</meta>
    <meta property="schema:accessModeSufficient">textual</meta>
    <meta property="schema:accessibilityFeature">structuralNavigation</meta>
    <meta property="schema:accessibilityFeature">tableOfContents</meta>
    <meta property="schema:accessibilityFeature">readingOrder</meta>
    <meta property="schema:accessibilityFeature">alternativeText</meta>
    <meta property="schema:accessibilityFeature">longDescription</meta>
    <meta property="schema:accessibilityHazard">none</meta>
    <meta property="schema:accessibilitySummary">This publication meets WCAG 2.0 Level AA guidelines. All images have alternative text. Content is structured with semantic markup and navigable via table of contents.</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="style" href="styles/epub.css" media-type="text/css"/>
${coverManifest}${manifestItems}
  </manifest>
  <spine toc="ncx">
${coverSpine}${spineItems}
  </spine>
</package>`;
}

export function navXhtml(meta: BookMeta, chapters: ProcessedChapter[]): string {
  const parts = groupByPart(chapters);
  let tocItems = '';

  for (const [partNum, partChapters] of parts) {
    const label = getPartLabel(partNum);
    tocItems += `      <li>\n        <span>${escapeXml(label)}</span>\n        <ol>\n`;
    for (const ch of partChapters) {
      tocItems += `          <li><a href="text/${ch.meta.slug}.xhtml">${escapeXml(ch.meta.title)}</a></li>\n`;
    }
    tocItems += `        </ol>\n      </li>\n`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${meta.language}">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeXml(meta.title)}</title>
  <link rel="stylesheet" type="text/css" href="styles/epub.css"/>
</head>
<body>
  <nav epub:type="toc" id="toc">
    <h1>Table of Contents</h1>
    <ol>
${tocItems}    </ol>
  </nav>
</body>
</html>`;
}

export function tocNcx(meta: BookMeta, chapters: ProcessedChapter[]): string {
  const navPoints = chapters
    .map(
      (ch, i) => `    <navPoint id="navPoint-${i + 1}" playOrder="${i + 1}">
      <navLabel><text>${escapeXml(ch.meta.title)}</text></navLabel>
      <content src="text/${ch.meta.slug}.xhtml"/>
    </navPoint>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="${meta.identifier}"/>
    <meta name="dtb:depth" content="3"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle><text>${escapeXml(meta.title)}</text></docTitle>
  <navMap>
${navPoints}
  </navMap>
</ncx>`;
}

export function coverXhtml(meta: BookMeta): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${meta.language}">
<head>
  <meta charset="UTF-8"/>
  <title>Cover</title>
  <style>
    body { margin: 0; padding: 0; text-align: center; }
    img { max-width: 100%; max-height: 100%; }
  </style>
</head>
<body epub:type="cover">
  <img src="../images/cover.png" alt="${escapeXml(meta.title)}"/>
</body>
</html>`;
}

export function chapterXhtml(
  meta: BookMeta,
  chapter: ProcessedChapter
): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xml:lang="${meta.language}">
<head>
  <meta charset="UTF-8"/>
  <title>${escapeXml(chapter.meta.title)}</title>
  <link rel="stylesheet" type="text/css" href="../styles/epub.css"/>
</head>
<body>
  <section epub:type="chapter" role="doc-chapter">
    <h1>${escapeXml(chapter.meta.title)}</h1>
${chapter.html}
  </section>
</body>
</html>`;
}

function getPartLabel(partNum: number): string {
  switch (partNum) {
    case 0: return 'Introduction';
    case 1: return 'Part One: The Strategies';
    case 2: return 'Part Two: The Field Guide';
    case 3: return 'Part Three: The General Method';
    case 4: return 'Appendices';
    default: return `Part ${partNum}`;
  }
}

function groupByPart(chapters: ProcessedChapter[]): Map<number, ProcessedChapter[]> {
  const map = new Map<number, ProcessedChapter[]>();
  for (const ch of chapters) {
    const arr = map.get(ch.meta.part) ?? [];
    arr.push(ch);
    map.set(ch.meta.part, arr);
  }
  return map;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
