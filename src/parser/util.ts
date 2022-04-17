import { TableCell, TableCellInternal } from './types';

export const eachCell = <C = TableCell>(
  table: C[][],
  callback: (cell: C, row: number, col: number) => void,
) => {
  table.forEach((rows, rowIndex) => {
    rows.forEach((cell, colIndex) => callback(cell, rowIndex, colIndex));
  });
};

export const mapCell = <O, C = TableCell>(
  table: C[][],
  callback: (cell: C, row: number, col: number) => O,
): O[][] => {
  return table.map((rows, rowIndex) =>
    rows.map((cell, colIndex) => callback(cell, rowIndex, colIndex)),
  );
};

export const cleanupInternal = (cell: TableCellInternal): TableCell => {
  return {
    content: cell.content,
    rowSpan: cell.rowSpan,
    colSpan: cell.colSpan,
    combinedChild: cell.combinedChild, // Is this cell will be trucuated by col/row span
    border: cell.border,
    align: cell.align,
    background: cell.background,
  };
};
