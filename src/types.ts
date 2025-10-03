import { THEMES } from './constants.ts';

export type Theme = (typeof THEMES)[keyof typeof THEMES];
