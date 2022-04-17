import { Declaration } from 'css';
import { Node } from 'node-html-parser';
import { ClassMap, PartialStyle } from './css';
import { getValue } from './css-util';
import { isElement, isTextNode } from './html-util';
import { Align, DecoratedContent } from './types';

export const createTextStyle = (declarations: Declaration[]): PartialStyle => {
  const style: PartialStyle = {
    fontStyles: [],
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

export const parseContent = (
  rawContent: Node[],
  classMap: ClassMap,
  cellStyle: PartialStyle,
): DecoratedContent[] => {
  const contents: DecoratedContent[] = [];

  for (const node of rawContent) {
    if (!isTextNode(node) && !isElement(node)) {
      continue;
    }

    const content = {
      color: cellStyle.color ?? null,
      fontStyles: cellStyle.fontStyles,
      content: node.textContent.trim(),
    };

    if (isElement(node)) {
      const className = node.getAttribute('class');
      if (className && classMap[className]) {
        const style = createTextStyle(classMap[className]);
        content.color = style.color ?? content.color;
        content.fontStyles = style.fontStyles ?? content.fontStyles;
      }
    }

    contents.push(content);
  }
  return contents;
};
