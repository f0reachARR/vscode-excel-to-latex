import { TableCell } from '../parser/types';

export const createLaTeXCell = (cell: TableCell): string => {
  return cell.content.map((decorated) => decorated.content).join('');
};
