import { TextStyle } from 'react-native';

export const fontFamily = {
  regular: undefined,
  medium: undefined,
  semibold: undefined,
  bold: undefined,
} as const;

export const typography = {
  hero: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
  } satisfies TextStyle,
  title: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  } satisfies TextStyle,
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 26,
  } satisfies TextStyle,
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  } satisfies TextStyle,
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  } satisfies TextStyle,
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  } satisfies TextStyle,
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  } satisfies TextStyle,
} as const;
