import { AtRule, Comment, Declaration, parse as parseCss, Rule } from 'css';
import {
  Align,
  ColorCode,
  DecoratedContent,
  TableInternal,
  TableCell,
  Border,
  BorderItem,
} from './types';
import { eachCell } from './util';

type PartialStyle = Pick<
  TableCell,
  'align' | 'border' | 'fontStyles' | 'background'
> & {
  color?: ColorCode;
};
type ClassMap = Record<string, Declaration[]>;
const getValue = (declarations: Declaration[], propertyName: string) => {
  return declarations.find(
    (declaration) => declaration.property === propertyName,
  )?.value;
};

const extractBorderColor = (
  border?: string,
  fallback?: string | null,
): BorderItem => {
  if (!border) {
    return fallback ?? null;
  }

  const splitted = border.split(/ /);
  if (splitted.length === 3) {
    return splitted[2];
  } else if (border.includes('none')) {
    return null;
  } else {
    return fallback ?? null;
  }
};

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
    fontStyles: [],
    border: createBorder(declarations),
  };

  if (declarations.length === 0) {
    return style;
  }

  const textAlign = getValue(declarations, 'text-align');
  if (textAlign && ['center', 'left', 'right'].includes(textAlign)) {
    style.align = textAlign as Align;
  }

  const color = getValue(declarations, 'color');
  if (color) {
    style.color = color;
  }

  const background = getValue(declarations, 'background');
  if (background) {
    style.background = background;
  }

  const fontStyle = getValue(declarations, 'font-style');
  if (fontStyle) {
    if (fontStyle.includes('italic')) {
      style.fontStyles.push('italic');
    }
  }

  const fontWeight = getValue(declarations, 'font-weight');
  if (fontWeight) {
    const fontWeightNum = Number(fontWeight);
    if (!isNaN(fontWeightNum) && fontWeightNum >= 700) {
      style.fontStyles.push('bold');
    }
  }

  const textDecoration = getValue(declarations, 'text-decoration');
  if (textDecoration) {
    if (textDecoration.includes('underline')) {
      style.fontStyles.push('underline');
    }
  }

  return style;
};

const parseContent = (
  rawContent: string,
  classMap: ClassMap,
  cellStyle: PartialStyle,
): DecoratedContent[] => {
  return [];
};

const filterRules = (rules?: Array<Rule | Comment | AtRule>): Rule[] =>
  rules?.filter((rule): rule is Rule => rule.type === 'rule') ?? [];

const filterDeclarations = (
  declarations?: Array<Declaration | Comment>,
): Declaration[] =>
  declarations?.filter(
    (declaration): declaration is Declaration =>
      declaration.type === 'declaration',
  ) ?? [];

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
  });
};
