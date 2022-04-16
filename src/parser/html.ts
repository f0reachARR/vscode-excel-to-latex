import { HTMLElement, NodeType, parse as parseHtml } from 'node-html-parser';
import { Table, TableCellInternal } from './types';

type Range = [number, number, number, number];
const isInRange = (range: Range, row: number, col: number) => {
  return (
    range[0] <= row && range[2] >= row && range[1] <= col && range[3] >= col
  );
};
const filterRange = (ranges: Range[], row: number, col: number) => {
  return ranges.filter((range) => isInRange(range, row, col));
};

export const parseHtmlToTable = (html: string): Table => {
  const table: Table = [];

  const dom = parseHtml(html);
  const rows = dom.childNodes
    .filter(
      (node): node is HTMLElement => node.nodeType === NodeType.ELEMENT_NODE,
    )
    .filter((node) => node.tagName === 'TR');

  const combinedRange: Array<Range> = [];
  for (const [rowIndex, row] of rows.entries()) {
    const cols = row.childNodes
      .filter(
        (node): node is HTMLElement => node.nodeType === NodeType.ELEMENT_NODE,
      )
      .filter((node) => node.tagName === 'TD');

    table.push([]);
    let actualColIndex = 0;
    for (const [, col] of cols.entries()) {
      // Padding combined cells
      const currentCombinedRange = filterRange(
        combinedRange,
        rowIndex,
        actualColIndex,
      );

      if (currentCombinedRange.length === 1) {
        actualColIndex = currentCombinedRange[0][3] + 1;
      } else if (currentCombinedRange.length > 1) {
        throw new Error('Unexpected range match found');
      }

      const cell: TableCellInternal = {
        rawContent: col.innerHTML,
        rowSpan: Number(col.getAttribute('rowspan') ?? 1), // Must be defined most top-left cell
        colSpan: Number(col.getAttribute('colspan') ?? 1),
        className: col.getAttribute('class') ?? '',
        inlineStyle: col.getAttribute('style') ?? '',
        combinedChild: false,
        fontStyles: [],
        content: [],
      };

      table[rowIndex][actualColIndex] = cell;

      if (cell.rowSpan > 1 || cell.colSpan > 1) {
        combinedRange.push([
          rowIndex,
          actualColIndex,
          rowIndex + cell.rowSpan - 1,
          actualColIndex + cell.colSpan - 1,
        ]);
      }

      actualColIndex++;
    }

    for (let i = 0; i < actualColIndex; i++) {
      table[rowIndex][i] = table[rowIndex][i] ?? {
        rawContent: '',
        rowSpan: 1,
        colSpan: 1,
        className: '',
        inlineStyle: '',
        combinedChild: true,
        fontStyles: [],
        content: [],
      };
    }
  }

  return table;
};
