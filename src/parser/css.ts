import { Declaration, parse as parseCss, Rule } from 'css';
import { createTextStyle, parseContent } from './css-text';
import {
  extractBorderColor,
  filterDeclarations,
  filterRules,
  getValue,
} from './css-util';
import { ColorCode, TableInternal, Border, TableCellInternal } from './types';
import { eachCell } from './util';

export type PartialStyle = Pick<
  TableCellInternal,
  'align' | 'border' | 'fontStyles' | 'background'
> & {
  color?: ColorCode;
};
export type ClassMap = Record<string, Declaration[]>;

const createBorder = (declarations: Declaration[], base?: Border): Border => {
  let border: Border = base ?? [null, null, null, null];

  const borderBase = extractBorderColor(getValue(declarations, 'border'));
  if (borderBase) {
    border = [borderBase, borderBase, borderBase, borderBase];
  }

  ['top', 'left', 'bottom', 'right'].forEach((key, i) => {
    border[i] = extractBorderColor(
      getValue(declarations, `border-${key}`),
      border[i],
    );
  });

  return border;
};

const createStyle = (declarations: Declaration[]): PartialStyle => {
  const style: PartialStyle = {
    ...createTextStyle(declarations),
    border: createBorder(declarations),
  };

  if (declarations.length === 0) {
    return style;
  }

  const background = getValue(declarations, 'background');
  if (background) {
    style.background = background;
  }

  return style;
};

const parseInlineStyle = (style: string): Declaration[] => {
  try {
    const { stylesheet } = parseCss(`td { ${style} }`);
    if (!stylesheet) {
      return [];
    }

    const rules = filterRules(stylesheet.rules);
    if (rules.length !== 1) {
      return [];
    }

    return filterDeclarations(rules[0].declarations) ?? [];
  } catch (e) {
    console.error('Failed to parse inline style', e);
    return [];
  }
};

export const parseCssAndApply = (table: TableInternal, css: string) => {
  const { stylesheet } = parseCss(css);
  if (!stylesheet) {
    return;
  }

  // Get default style for table data
  const defaultRule = filterRules(stylesheet.rules).find(({ selectors }) =>
    selectors?.some((selector) => selector === 'td'),
  );
  const defaultDeclarations = filterDeclarations(defaultRule?.declarations);

  // Extract all classes
  const classRules = stylesheet.rules
    .filter((rule): rule is Rule => rule.type === 'rule')
    .filter(({ selectors }) =>
      selectors?.some((selector) => selector.startsWith('.')),
    );
  const classMap: ClassMap = {};

  for (const rule of classRules) {
    if (!rule.selectors) {
      return;
    }

    const className = rule.selectors[0].replace(/^\./, '');
    classMap[className] = filterDeclarations(rule.declarations);
  }

  // Apply style for each cell
  eachCell(table, (cell) => {
    const inlineStyleDeclarations =
      cell.inlineStyle.trim() !== '' ? parseInlineStyle(cell.inlineStyle) : [];
    const mergedDeclarations = [
      ...inlineStyleDeclarations,
      ...(classMap[cell.className] ?? []),
      ...defaultDeclarations,
    ];
    const style = createStyle(mergedDeclarations);

    Object.assign(cell, style);

    cell.content = parseContent(cell.rawContent, classMap, style);
  });
};
