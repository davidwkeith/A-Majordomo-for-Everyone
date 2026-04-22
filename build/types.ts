export interface ChapterMeta {
  title: string;
  part: number;
  order: number;
  strategy: number | null;
  status: string;
  slug: string;
  sourceFile: string;
}

export interface ProcessedChapter {
  meta: ChapterMeta;
  html: string;
  endnotes: Endnote[];
}

export interface Endnote {
  id: string;
  content: string;
}

export interface Contributor {
  name: string;
  /** MARC relator code: edt, ill, etc. */
  role: string;
  id: string;
}

export interface BookMeta {
  title: string;
  subtitle: string;
  language: string;
  creator: string;
  publisher: string;
  rights: string;
  identifier: string;
  date: string;
  subjects: string[];
  contributors: Contributor[];
}

export const BOOK_META: BookMeta = {
  title: 'Majordomo',
  subtitle: 'Billionaires have staff, now you do too.',
  language: 'en-US',
  creator: 'David W. Keith',
  publisher: 'David W. Keith',
  rights: 'Copyright © 2025 David W. Keith. Licensed under Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).',
  identifier: 'urn:uuid:3f95fd4d-bc11-427e-aa0f-d79a22eaadfa',
  date: new Date().toISOString().split('T')[0],
  subjects: [
    'COMPUTERS / Artificial Intelligence / General',
    'SELF-HELP / Personal Growth / General',
  ],
  contributors: [
    { name: 'David W. Keith', role: 'edt', id: 'editor' },
    { name: 'David W. Keith', role: 'ill', id: 'illustrator' },
  ],
};

export const CALLOUT_TYPES = [
  'science',
  'tip',
  'fairness',
  'meme',
  'spec',
  'also',
] as const;

export type CalloutType = (typeof CALLOUT_TYPES)[number];
