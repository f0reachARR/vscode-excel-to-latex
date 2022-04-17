import { parseCssAndApply } from './css';
import { parseHtmlToTable } from './html';
import { cleanupInternal, mapCell } from './util';

const cssExtractor = new RegExp(/<style.*?>.*?<!--(.+?)-->.*?<\/style>/gims);
const fragmentExtractor = new RegExp(
  /<!--StartFragment-->(.+)<!--EndFragment-->/gims,
);
export const parseExcelHtml = (html: string) => {
  const cssMatch = cssExtractor.exec(html);
  const fragmentMatch = fragmentExtractor.exec(html);

  if (!cssMatch || !fragmentMatch) {
    return;
  }

  const table = parseHtmlToTable(fragmentMatch[1]);
  parseCssAndApply(table, cssMatch[1]);
  return mapCell(table, cleanupInternal);
};
