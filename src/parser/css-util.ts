import { AtRule, Comment, Declaration, Rule } from 'css';
import { BorderItem } from './types';

export const getValue = (declarations: Declaration[], propertyName: string) => {
  return declarations.find(
    (declaration) => declaration.property === propertyName,
  )?.value;
};

export const extractBorderColor = (
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

export const filterRules = (rules?: Array<Rule | Comment | AtRule>): Rule[] =>
  rules?.filter((rule): rule is Rule => rule.type === 'rule') ?? [];

export const filterDeclarations = (
  declarations?: Array<Declaration | Comment>,
): Declaration[] =>
  declarations?.filter(
    (declaration): declaration is Declaration =>
      declaration.type === 'declaration',
  ) ?? [];
