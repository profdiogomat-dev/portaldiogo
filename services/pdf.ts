import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.6.82/pdf.worker.min.js';

export async function extractPdfText(file: File): Promise<string[]> {
  const data = new Uint8Array(await file.arrayBuffer());
  const pdf = await getDocument({ data }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items.map((it: any) => it.str).join(' ');
    pages.push(text);
  }
  return pages;
}

export type ParsedQuestion = {
  text: string;
  options: { A?: string; B?: string; C?: string; D?: string };
  correctOption?: string;
  imageUrl?: string;
};

function splitQuestions(raw: string): string[] {
  const normalized = raw.replace(/\r/g, '').replace(/\s+/g, ' ').trim();
  const parts: string[] = [];
  const regex = /(\b(?:Quest[ãa]o|Q)\s*\d+\)?|\b\d+\s*[\)\.]\s)/gi;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(normalized))) {
    const start = m.index;
    if (start > lastIndex) parts.push(normalized.slice(lastIndex, start));
    lastIndex = start;
  }
  if (lastIndex < normalized.length) parts.push(normalized.slice(lastIndex));
  return parts.map(p => p.trim()).filter(p => p.length > 0);
}

function parseOptions(block: string) {
  const opt: any = {};
  const map: Record<string, RegExp> = {
    A: /(\bA\)|\b[A]\)|\b[A]\.|\bAlternativa\s*A\b)\s*(.*?)(?=\bB\)|\b[B]\)|\b[B]\.|$)/i,
    B: /(\bB\)|\b[B]\)|\b[B]\.|\bAlternativa\s*B\b)\s*(.*?)(?=\bC\)|\b[C]\)|\b[C]\.|$)/i,
    C: /(\bC\)|\b[C]\)|\b[C]\.|\bAlternativa\s*C\b)\s*(.*?)(?=\bD\)|\b[D]\)|\b[D]\.|$)/i,
    D: /(\bD\)|\b[D]\)|\b[D]\.|\bAlternativa\s*D\b)\s*(.*)/i,
  };
  for (const k of ['A','B','C','D']) {
    const r = map[k];
    const m = r.exec(block);
    if (m && m[2]) opt[k] = m[2].trim();
  }
  return opt;
}

export async function parsePdfQuestions(file: File): Promise<ParsedQuestion[]> {
  const pages = await extractPdfText(file);
  const all = pages.join('\n');
  const blocks = splitQuestions(all);
  const result: ParsedQuestion[] = [];
  for (const b of blocks) {
    const options = parseOptions(b);
    const text = b.replace(/\b[ABCD][\)\.]\s[\s\S]*/i, '').trim();
    result.push({ text, options });
  }
  return result.filter(q => q.text);
}
