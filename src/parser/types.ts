export type ColorCode = string;
export type BorderItem = ColorCode | null;
export type Border = [BorderItem, BorderItem, BorderItem, BorderItem];
export type Align = 'left' | 'right' | 'center';
export type FontStyle = 'italic' | 'bold' | 'underline';

export interface DecoratedContent {
  color: ColorCode | null;
  fontStyles: FontStyle[];
  content: string;
}

export interface TableCell {
  content: Array<DecoratedContent>;
  rowSpan: number;
  colSpan: number;
  combinedChild: boolean; // Is this cell will be trucuated by col/row span
  border?: Border;
  align?: Align;
  background?: ColorCode;
  fontStyles: FontStyle[];
}
export type Table = Array<Array<TableCell>>;

export type TableCellInternal = TableCell & {
  className: string;
  rawContent: string;
  inlineStyle: string;
};
export type TableInternal = Array<Array<TableCellInternal>>;
