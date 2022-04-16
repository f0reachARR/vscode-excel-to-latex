export type ColorCode = string;
export type Border = ColorCode | null;
export type Align = 'left' | 'right' | 'center';
export type FontStyle = 'italic' | 'bold';

export interface DecolatedContent {
  color: ColorCode | null;
  fontStyles: FontStyle[];
  content: string;
}

export interface TableCell {
  content: Array<DecolatedContent>;
  rowSpan: number;
  colSpan: number;
  combinedChild: boolean; // Is this cell will be trucuated by col/row span
  border: [Border, Border, Border, Border] | null;
  align: Align;
  fontStyles: FontStyle[];
}
export type Table = Array<Array<TableCell>>;

export type TableCellInternal = TableCell & {
  className: string;
  rawContent: string;
  inlineStyle: string;
};
