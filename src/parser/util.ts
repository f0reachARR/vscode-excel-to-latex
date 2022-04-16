import { TableCell } from './types';

export const eachCell = <C = TableCell>(
  table: C[][],
  callback: (cell: C, row: number, col: number) => void,
) => {
  table.forEach((rows, rowIndex) => {
    rows.forEach((cell, colIndex) => callback(cell, rowIndex, colIndex));
  });
};
