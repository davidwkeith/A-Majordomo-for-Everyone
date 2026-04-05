import JSZip from 'jszip';
import { writeFile, readFile, readdir, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import type { BookMeta, ProcessedChapter } from '../types.js';
import {
  containerXml,
  contentOpf,
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

  // mimetype must be first and uncompressed
  zip.file('mimetype', 'application/epub+zip', {
    compression: 'STORE',
  });

  // Container
  zip.file('META-INF/container.xml', containerXml());

  // OPF
  zip.file('OEBPS/content.opf', contentOpf(meta, chapters));

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

  // Images (if any exist)
  try {
    const entries = await readdir(imagesDir, { recursive: true });
    const imageExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];
    const imageFiles = entries.filter((f: string) =>
      imageExts.some((ext) => f.toLowerCase().endsWith(ext))
    );
    for (const imgFile of imageFiles) {
      const imgData = await readFile(join(imagesDir, imgFile));
      zip.file(`OEBPS/images/${imgFile}`, imgData);
    }
  } catch {
    // No images directory or no images — fine
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
