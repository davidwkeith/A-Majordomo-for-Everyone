import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import {
  ROOT,
  CONTENT_DIR,
  STYLES_DIR,
  IMAGES_DIR,
  createProcessor,
  discoverBriefs,
  discoverChapters,
  processChapter,
  sortChapters,
  optimizeImages,
  getPartLabel,
  groupByPart,
} from '../pipeline.js';
import { BOOK_META } from '../types.js';

const OUTPUT_PATH = join(ROOT, 'dist', 'a-majordomo-for-everyone.pdf');

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function buildPdf(): Promise<void> {
  console.log('Discovering art briefs...');
  const briefs = discoverBriefs(CONTENT_DIR);
  console.log(`Found ${briefs.size} art brief(s)`);

  const processor = createProcessor(briefs);

  console.log('Discovering chapters...');
  const files = await discoverChapters();
  console.log(`Found ${files.length} chapter files`);

  console.log('Processing chapters...');
  const chapters = await Promise.all(
    files.map((f) => processChapter(f, processor))
  );
  const sorted = sortChapters(chapters);

  // Optimize images
  const imgDir = join(ROOT, 'dist', '.pdf-images');
  console.log('Optimizing images...');
  await optimizeImages(IMAGES_DIR, imgDir, 800);

  // Read and fix CSS image paths for local rendering
  const imgUrl = pathToFileURL(imgDir).href;
  const baseCss = await readFile(join(STYLES_DIR, 'base.css'), 'utf-8');
  const pdfCss = await readFile(join(STYLES_DIR, 'pdf.css'), 'utf-8');
  const css = (baseCss + '\n' + pdfCss).replace(
    /url\(\.\.\/images\//g,
    `url(${imgUrl}/`
  );

  // Build TOC
  const parts = groupByPart(sorted);
  let tocItems = '';
  for (const [partNum, partChapters] of parts) {
    tocItems += `<h3>${escapeHtml(getPartLabel(partNum))}</h3>\n<ul>\n`;
    for (const ch of partChapters) {
      tocItems += `  <li>${escapeHtml(ch.meta.title)}</li>\n`;
    }
    tocItems += '</ul>\n';
  }

  // Build chapter sections
  let chaptersHtml = '';
  for (const ch of sorted) {
    const html = ch.html.replace(/src="\.\.\/images\//g, `src="${imgUrl}/`);
    chaptersHtml += `<section class="chapter">\n<h1>${escapeHtml(ch.meta.title)}</h1>\n${html}\n</section>\n`;
  }

  const fullHtml = `<!DOCTYPE html>
<html lang="${BOOK_META.language}">
<head>
  <meta charset="UTF-8">
  <style>${css}</style>
</head>
<body>
  <section class="title-page">
    <h1>${escapeHtml(BOOK_META.title)}</h1>
    <p class="subtitle">${escapeHtml(BOOK_META.subtitle)}</p>
    <p class="author">${escapeHtml(BOOK_META.creator)}</p>
    <p class="rights">${escapeHtml(BOOK_META.rights)}</p>
  </section>
  <section class="pdf-toc">
    <h2>Table of Contents</h2>
${tocItems}  </section>
${chaptersHtml}</body>
</html>`;

  // Write HTML source for Playwright to render
  await mkdir(join(ROOT, 'dist'), { recursive: true });
  const htmlPath = join(ROOT, 'dist', '.pdf-source.html');
  await writeFile(htmlPath, fullHtml);

  // Render PDF
  console.log('Rendering PDF...');
  try {
    const browser = await chromium.launch({
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
    const page = await browser.newPage();
    await page.emulateMedia({ colorScheme: 'light', media: 'print' });
    await page.goto(pathToFileURL(htmlPath).href, {
      waitUntil: 'networkidle',
    });
    await page.pdf({
      path: OUTPUT_PATH,
      format: 'Letter',
      margin: {
        top: '0.75in',
        right: '0.75in',
        bottom: '0.75in',
        left: '0.75in',
      },
      printBackground: true,
    });
    await browser.close();
    console.log(`PDF written to ${OUTPUT_PATH}`);
  } catch (err) {
    console.warn('PDF rendering failed:', (err as Error).message);
    console.warn('Try: npx playwright install chromium');
  }
}

buildPdf().catch((err) => {
  console.error('PDF build failed:', err);
  process.exit(1);
});
