import type { BookMeta, ProcessedChapter } from '../types.js';

export function containerXml(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
}

export function contentOpf(meta: BookMeta, chapters: ProcessedChapter[]): string {
  const manifestItems = chapters
    .map(
      (ch) =>
        `    <item id="${ch.meta.slug}" href="text/${ch.meta.slug}.xhtml" media-type="application/xhtml+xml"/>`
    )
    .join('\n');

  const spineItems = chapters
    .map((ch) => `    <itemref idref="${ch.meta.slug}"/>`)
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="BookId" xml:lang="${meta.language}">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="BookId">${meta.identifier}</dc:identifier>
    <dc:title>${escapeXml(meta.title)}</dc:title>
    <dc:creator>${escapeXml(meta.creator)}</dc:creator>
    <dc:language>${meta.language}</dc:language>
    <dc:rights>${escapeXml(meta.rights)}</dc:rights>
    <dc:description>${escapeXml(meta.subtitle)}</dc:description>
    <dc:date>${meta.date}</dc:date>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
    <item id="style" href="styles/epub.css" media-type="text/css"/>
${manifestItems}
  </manifest>
  <spine toc="ncx">
${spineItems}
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
