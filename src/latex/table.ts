import { Table } from '../parser/types';
import { createLaTeXCell } from './cell';

type IndentedText = Array<[number, string]>;
const getTableColCount = (table: Table) => {
  return table[0].length;
};

const createColsDefinition = (table: Table): string => {
  const colNum = getTableColCount(table);
  return new Array(colNum + 1).join('c');
};

const getLengthWithFontSize = (input: string) => {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[^\x01-\x7E]/g, 'XX').length;
};

const repeatText = (text: string, count: number) => {
  return new Array(count + 1).fill('').join(text);
};

const createSpacedCells = (cells: Array<string[]>): Array<string[]> => {
  const colsSize = cells.map((rows) =>
    rows.map((row) => getLengthWithFontSize(row)),
  );
  const maxColsSize = cells[0].map((_row, index) =>
    Math.max(...colsSize.map((rows) => rows[index])),
  );

  return cells.map((rows, rowIndex) =>
    rows.map(
      (cell, colIndex) =>
        cell +
        repeatText(' ', maxColsSize[colIndex] - colsSize[rowIndex][colIndex]),
    ),
  );
};

const createIndentedText = (
  text: IndentedText,
  space: boolean,
  spaceSize = 4,
  baseIndent = 0,
) => {
  const indentChar = space ? new Array(spaceSize + 1).fill('').join(' ') : '\t';
  return text
    .map(([indent, text]) => {
      return repeatText(indentChar, indent + baseIndent) + text;
    })
    .join('\n');
};

export interface LaTeXTableConfig {
  space: boolean;
  spaceSize?: number;
  baseIndent?: number;
}

export const createLaTeXTable = (
  table: Table,
  config: LaTeXTableConfig,
): string => {
  const colsDef = createColsDefinition(table);
  const cells = createSpacedCells(table.map((row) => row.map(createLaTeXCell)));

  return createIndentedText(
    [
      [0, '\\begin{table}'],
      [1, `\\begin{tabular}{${colsDef}}`],
      ...cells.map((row) => [2, row.join(' & ') + '\\\\'] as [number, string]),
      [1, '\\end{tabular}'],
      [0, '\\end{table}'],
    ],
    config.space,
    config.spaceSize,
    config.baseIndent,
  );
};
