import type { BookMeta, ProcessedChapter } from '../types.js';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getPartLabel(partNum: number): string {
  switch (partNum) {
    case 0:
      return 'Introduction';
    case 1:
      return 'Part One: The Strategies';
    case 2:
      return 'Part Two: The Field Guide';
    case 3:
      return 'Part Three: The General Method';
    case 4:
      return 'Appendices';
    default:
      return `Part ${partNum}`;
  }
}

function groupByPart(
  chapters: ProcessedChapter[]
): Map<number, ProcessedChapter[]> {
  const map = new Map<number, ProcessedChapter[]>();
  for (const ch of chapters) {
    const arr = map.get(ch.meta.part) ?? [];
    arr.push(ch);
    map.set(ch.meta.part, arr);
  }
  return map;
}

function tocSidebar(
  chapters: ProcessedChapter[],
  current?: ProcessedChapter
): string {
  const parts = groupByPart(chapters);
  let html = '';

  for (const [partNum, partChapters] of parts) {
    const label = getPartLabel(partNum);
    const isCurrent = current && current.meta.part === partNum;
    const open = isCurrent ? ' open' : '';

    html += `      <li><details${open}>\n`;
    html += `        <summary>${escapeHtml(label)}</summary>\n`;
    html += `        <ol>\n`;
    for (const ch of partChapters) {
      const active =
        current && ch.meta.slug === current.meta.slug
          ? ' class="toc-current"'
          : '';
      const aria =
        current && ch.meta.slug === current.meta.slug
          ? ' aria-current="page"'
          : '';
      html += `          <li${active}><a href="/read/${escapeHtml(ch.meta.slug)}/"${aria}>${escapeHtml(ch.meta.title)}</a></li>\n`;
    }
    html += `        </ol>\n`;
    html += `      </details></li>\n`;
  }

  return html;
}

function pageShell(
  meta: BookMeta,
  title: string,
  body: string,
  options: {
    chapters?: ProcessedChapter[];
    current?: ProcessedChapter;
    hasSidebar?: boolean;
  } = {}
): string {
  const { chapters, current, hasSidebar = true } = options;
  const fullTitle =
    title === meta.title ? title : `${title} — ${meta.title}`;

  let sidebar = '';
  if (hasSidebar && chapters) {
    sidebar = `  <input type="checkbox" id="toc-toggle" checked>
  <label for="toc-toggle" class="toc-btn" aria-label="Table of contents"><span></span></label>
  <label for="toc-toggle" class="overlay" aria-hidden="true"></label>
  <aside class="sidebar">
    <a href="/" class="sidebar-title">${escapeHtml(meta.title)}</a>
    <nav aria-label="Table of contents">
      <ol class="toc">
${tocSidebar(chapters, current)}      </ol>
    </nav>
  </aside>
`;
  }

  return `<!DOCTYPE html>
<html lang="${meta.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <title>${escapeHtml(fullTitle)}</title>
  <link rel="stylesheet" href="/styles/site.css">
</head>
<body>
${sidebar}  <main>
${body}  </main>
${hasSidebar ? '  <script>if(innerWidth<960)document.getElementById("toc-toggle").checked=false</script>\n' : ''}</body>
</html>`;
}

export function chapterPage(
  meta: BookMeta,
  chapter: ProcessedChapter,
  prev: ProcessedChapter | null,
  next: ProcessedChapter | null,
  allChapters: ProcessedChapter[]
): string {
  let nav = '';
  if (prev || next) {
    nav += '    <nav class="chapter-nav" aria-label="Chapter navigation">\n';
    if (prev) {
      nav += `      <a href="/read/${escapeHtml(prev.meta.slug)}/" class="chapter-nav-prev" rel="prev">
        <span class="chapter-nav-dir">Previous</span>
        <span class="chapter-nav-title">${escapeHtml(prev.meta.title)}</span>
      </a>\n`;
    }
    if (next) {
      nav += `      <a href="/read/${escapeHtml(next.meta.slug)}/" class="chapter-nav-next" rel="next">
        <span class="chapter-nav-dir">Next</span>
        <span class="chapter-nav-title">${escapeHtml(next.meta.title)}</span>
      </a>\n`;
    }
    nav += '    </nav>\n';
  }

  const footer = `    <footer class="site-footer">
      <p><a href="/">${escapeHtml(meta.title)}</a> by ${escapeHtml(meta.creator)}</p>
      <p>Licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></p>
    </footer>\n`;

  const body = `    <article>
      <h1>${escapeHtml(chapter.meta.title)}</h1>
${chapter.html}
    </article>
${nav}${footer}`;

  return pageShell(meta, chapter.meta.title, body, {
    chapters: allChapters,
    current: chapter,
  });
}

export function tocPage(
  meta: BookMeta,
  chapters: ProcessedChapter[]
): string {
  const parts = groupByPart(chapters);
  let list = '';

  for (const [partNum, partChapters] of parts) {
    const label = getPartLabel(partNum);
    list += `      <h2>${escapeHtml(label)}</h2>\n`;
    list += `      <ol>\n`;
    for (const ch of partChapters) {
      list += `        <li><a href="/read/${escapeHtml(ch.meta.slug)}/">${escapeHtml(ch.meta.title)}</a></li>\n`;
    }
    list += `      </ol>\n`;
  }

  const body = `    <div class="toc-page">
      <h1>Table of Contents</h1>
${list}    </div>
    <footer class="site-footer">
      <p><a href="/">${escapeHtml(meta.title)}</a> by ${escapeHtml(meta.creator)}</p>
      <p>Licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">CC BY-SA 4.0</a></p>
    </footer>\n`;

  return pageShell(meta, 'Table of Contents', body, { chapters });
}

export function landingPage(meta: BookMeta): string {
  return `<!DOCTYPE html>
<html lang="${meta.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <title>${escapeHtml(meta.title)} — ${escapeHtml(meta.subtitle)}</title>
  <meta name="description" content="The billionaire class has always had access to experts who explain things in plain language. Now you have something close to that, for free, on your phone.">
  <link rel="stylesheet" href="/styles/site.css">
</head>
<body class="landing">
  <header class="hero">
    <img src="/images/cover.png" alt="${escapeHtml(meta.title)}" class="hero-cover">
    <div class="hero-text">
      <h1>${escapeHtml(meta.title)}</h1>
      <p class="hero-subtitle">${escapeHtml(meta.subtitle)}</p>
      <p class="hero-pitch">The billionaire class has always had access to lawyers, doctors, and financial advisors who explain things in plain language &mdash; now you have something close to that, for free, on your phone.</p>
      <a href="/read/" class="hero-cta">Start Reading</a>
    </div>
  </header>
  <div class="landing-content">
    <h2>What This Book Is</h2>
    <p><em>This Old House</em>, but for living in a capitalist society. A practical guide to using free AI tools &mdash; the ones already on your phone &mdash; to navigate health insurance, legal questions, financial decisions, and the rest of the systems that were designed to confuse you.</p>
    <p>No jargon. No hype. No "take ownership of your journey." Just the tools, the strategies, and the specific sentences to type.</p>

    <h2>What You Get</h2>
    <p><strong>Ten strategies</strong> for getting useful answers out of AI &mdash; from writing a clear specification to knowing when to push back on what it tells you.</p>
    <p><strong>A field guide</strong> covering health, money, legal, home, work, civic life, and more &mdash; each entry showing exactly how to apply the strategies to real situations.</p>
    <p><strong>A general method</strong> for deciding when to use AI, when to use a human, and how to get consistent results without paying for premium tiers.</p>

    <h2>Who It's For</h2>
    <p>Adults who already know the system is broken and just want to know what to do. People who remember when the internet was supposed to democratize everything, watched it get strip-mined by venture capital, and are still here.</p>

    <h2>Free and Open</h2>
    <p>This book is licensed under <a href="https://creativecommons.org/licenses/by-sa/4.0/">Creative Commons BY-SA 4.0</a>. Read it, share it, build on it.</p>
  </div>
  <footer class="landing-footer">
    <p>By ${escapeHtml(meta.creator)} &middot; ${escapeHtml(meta.rights)}</p>
  </footer>
</body>
</html>`;
}

export function notFoundPage(meta: BookMeta): string {
  return `<!DOCTYPE html>
<html lang="${meta.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <title>Not Found — ${escapeHtml(meta.title)}</title>
  <link rel="stylesheet" href="/styles/site.css">
</head>
<body>
  <main>
    <div class="not-found">
      <h1>404</h1>
      <p>The page you're looking for doesn't exist.</p>
      <p><a href="/">Back to the book</a></p>
    </div>
  </main>
</body>
</html>`;
}
