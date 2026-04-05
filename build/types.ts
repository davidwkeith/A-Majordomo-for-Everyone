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

export interface BookMeta {
  title: string;
  subtitle: string;
  language: string;
  creator: string;
  rights: string;
  identifier: string;
  date: string;
}

export const BOOK_META: BookMeta = {
  title: 'A Majordomo for Everyone',
  subtitle: 'Managing Your Personal Staff of AI Agents',
  language: 'en-US',
  creator: 'David W. Keith',
  rights: 'CC BY-SA 4.0',
  identifier: 'urn:uuid:majordomo-for-everyone-v1',
  date: new Date().toISOString().split('T')[0],
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
