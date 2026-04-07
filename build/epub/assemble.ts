import JSZip from 'jszip';
import { writeFile, readFile, readdir, mkdir, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import type { BookMeta, ProcessedChapter } from '../types.js';
import {
  containerXml,
  contentOpf,
  coverXhtml,
  navXhtml,
  tocNcx,
  chapterXhtml,
} from './templates.js';

/**
 * Assemble an ePub 3.0 file from processed chapters.
 *
 * ePub is a ZIP with specific structure:
 * - mimetype (uncompressed, first entry)
 * - META-INF/container.xml
 * - OEBPS/content.opf
 * - OEBPS/nav.xhtml
 * - OEBPS/toc.ncx
 * - OEBPS/styles/epub.css
 * - OEBPS/text/*.xhtml
 * - OEBPS/images/*
 */
export async function assembleEpub(
  meta: BookMeta,
  chapters: ProcessedChapter[],
  cssPath: string,
  imagesDir: string,
  outputPath: string
): Promise<void> {
  const zip = new JSZip();

  // Detect cover image
  const coverPath = join(imagesDir, 'cover.png');
  let hasCover = false;
  try {
    await access(coverPath);
    hasCover = true;
  } catch {
    // No cover image
  }

  // mimetype must be first and uncompressed
  zip.file('mimetype', 'application/epub+zip', {
    compression: 'STORE',
  });

  // Container
  zip.file('META-INF/container.xml', containerXml());

  // Collect images from src/images/
  const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
  const isImage = (f: string) =>
    imageExts.some((ext) => f.toLowerCase().endsWith(ext));

  const imageFiles: string[] = [];
  try {
    const entries = await readdir(imagesDir, { recursive: true });
    for (const f of entries.filter((f: string) => isImage(f))) {
      const imgData = await readFile(join(imagesDir, f));
      zip.file(`OEBPS/images/${f}`, imgData);
      if (f !== 'cover.png') imageFiles.push(f);
    }
  } catch {
    // No images directory — fine
  }

  // OPF — must come after image collection so manifest is complete
  zip.file('OEBPS/content.opf', contentOpf(meta, chapters, hasCover, imageFiles));

  // Cover page
  if (hasCover) {
    zip.file('OEBPS/text/cover.xhtml', coverXhtml(meta));
  }

  // Navigation
  zip.file('OEBPS/nav.xhtml', navXhtml(meta, chapters));
  zip.file('OEBPS/toc.ncx', tocNcx(meta, chapters));

  // CSS
  const css = await readFile(cssPath, 'utf-8');
  zip.file('OEBPS/styles/epub.css', css);

  // Chapters
  for (const chapter of chapters) {
    const xhtml = chapterXhtml(meta, chapter);
    zip.file(`OEBPS/text/${chapter.meta.slug}.xhtml`, xhtml);
  }

  // Generate the ZIP buffer
  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    mimeType: 'application/epub+zip',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, buffer);
}
