import { colors } from '@/theme/colors';

export type StreamingProviderBrandGradient = readonly [string, string];

export type StreamingProviderBrandStops = readonly [string, string, string, string];

export interface StreamingProviderBrandTheme {
  base: StreamingProviderBrandStops;
  baseLocations: readonly [number, number, number, number];
  glow: string;
  mesh: string;
  beam: string;
  edge: string;
  /** Solid fallback + bottom fade tint (avoid neutral black washing out brand color). */
  fill: string;
  backdropBottom: string;
}

const KNOWN_PROVIDER_THEMES: Record<number, StreamingProviderBrandTheme> = {
  8: {
    base: ['#FF5A5A', '#E50914', '#B20710', '#6B0A12'],
    baseLocations: [0, 0.32, 0.68, 1],
    glow: 'rgba(255, 90, 90, 0.45)',
    mesh: 'rgba(255, 40, 40, 0.38)',
    beam: 'rgba(255, 200, 200, 0.22)',
    edge: 'rgba(255, 120, 120, 0.65)',
    fill: '#C40812',
    backdropBottom: 'rgba(107, 7, 16, 0.72)',
  },
  337: {
    base: ['#4D7BFF', '#2563EB', '#0F2860', '#040818'],
    baseLocations: [0, 0.3, 0.65, 1],
    glow: 'rgba(130, 170, 255, 0.42)',
    mesh: 'rgba(60, 100, 255, 0.32)',
    beam: 'rgba(180, 210, 255, 0.2)',
    edge: 'rgba(120, 170, 255, 0.62)',
    fill: '#1E40AF',
    backdropBottom: 'rgba(15, 40, 96, 0.72)',
  },
  119: {
    base: ['#5CE1FF', '#00A8E1', '#005F8C', '#001828'],
    baseLocations: [0, 0.28, 0.62, 1],
    glow: 'rgba(80, 220, 255, 0.4)',
    mesh: 'rgba(0, 180, 230, 0.28)',
    beam: 'rgba(200, 245, 255, 0.22)',
    edge: 'rgba(80, 210, 255, 0.58)',
    fill: '#007EB9',
    backdropBottom: 'rgba(0, 60, 92, 0.7)',
  },
  350: {
    base: ['#5C5C64', '#2C2C30', '#141416', '#050506'],
    baseLocations: [0, 0.35, 0.7, 1],
    glow: 'rgba(255, 255, 255, 0.14)',
    mesh: 'rgba(200, 200, 210, 0.12)',
    beam: 'rgba(255, 255, 255, 0.1)',
    edge: 'rgba(255, 255, 255, 0.16)',
    fill: '#2C2C30',
    backdropBottom: 'rgba(20, 20, 22, 0.75)',
  },
  1899: {
    base: ['#A855F7', '#7C3AED', '#3B1570', '#120428'],
    baseLocations: [0, 0.32, 0.66, 1],
    glow: 'rgba(190, 130, 255, 0.4)',
    mesh: 'rgba(120, 60, 200, 0.3)',
    beam: 'rgba(220, 180, 255, 0.18)',
    edge: 'rgba(200, 150, 255, 0.2)',
    fill: '#6B2D8B',
    backdropBottom: 'rgba(45, 15, 63, 0.72)',
  },
  283: {
    base: ['#FFB347', '#F47521', '#8C3A0A', '#2A0E02'],
    baseLocations: [0, 0.3, 0.64, 1],
    glow: 'rgba(255, 170, 80, 0.38)',
    mesh: 'rgba(255, 120, 40, 0.28)',
    beam: 'rgba(255, 220, 180, 0.2)',
    edge: 'rgba(255, 190, 130, 0.2)',
    fill: '#E85D04',
    backdropBottom: 'rgba(90, 35, 4, 0.72)',
  },
  29: {
    base: ['#A855FF', '#7C3AED', '#3B0F80', '#140330'],
    baseLocations: [0, 0.34, 0.68, 1],
    glow: 'rgba(170, 110, 255, 0.4)',
    mesh: 'rgba(100, 40, 200, 0.3)',
    beam: 'rgba(210, 170, 255, 0.18)',
    edge: 'rgba(190, 140, 255, 0.2)',
    fill: '#5B21B6',
    backdropBottom: 'rgba(24, 6, 48, 0.72)',
  },
  531: {
    base: ['#3D3D3D', '#1A1A1A', '#0A0A0A', '#000000'],
    baseLocations: [0, 0.38, 0.72, 1],
    glow: 'rgba(255, 255, 255, 0.1)',
    mesh: 'rgba(80, 80, 80, 0.25)',
    beam: 'rgba(255, 255, 255, 0.08)',
    edge: 'rgba(255, 255, 255, 0.14)',
    fill: '#1A1A1A',
    backdropBottom: 'rgba(0, 0, 0, 0.65)',
  },
  384: {
    base: ['#FF5C5C', '#E50914', '#6B1018', '#1A0406'],
    baseLocations: [0, 0.3, 0.65, 1],
    glow: 'rgba(255, 100, 100, 0.38)',
    mesh: 'rgba(220, 40, 40, 0.28)',
    beam: 'rgba(255, 200, 200, 0.18)',
    edge: 'rgba(255, 130, 130, 0.22)',
    fill: '#B20710',
    backdropBottom: 'rgba(80, 8, 14, 0.72)',
  },
  2: {
    base: ['#4A4A54', '#282830', '#121218', '#060608'],
    baseLocations: [0, 0.36, 0.7, 1],
    glow: colors.accentTint18,
    mesh: 'rgba(196, 163, 90, 0.15)',
    beam: 'rgba(212, 179, 106, 0.12)',
    edge: colors.borderSubtle,
    fill: '#282830',
    backdropBottom: 'rgba(10, 10, 15, 0.7)',
  },
};

const DEFAULT_THEME: StreamingProviderBrandTheme = {
  base: ['#3A3A4A', '#242430', '#14141C', colors.background],
  baseLocations: [0, 0.34, 0.72, 1],
  glow: colors.accentTint18,
  mesh: 'rgba(196, 163, 90, 0.12)',
  beam: 'rgba(255, 255, 255, 0.08)',
  edge: colors.borderSubtle,
  fill: colors.surfaceElevated,
  backdropBottom: 'rgba(10, 10, 15, 0.65)',
};

export function getStreamingProviderBrandTheme(
  providerId: number,
): StreamingProviderBrandTheme {
  return KNOWN_PROVIDER_THEMES[providerId] ?? DEFAULT_THEME;
}

export function getStreamingProviderBrandGradient(
  providerId: number,
): StreamingProviderBrandGradient {
  const theme = getStreamingProviderBrandTheme(providerId);
  return [theme.base[0], theme.base[3]];
}

/** iOS/Android shadow tint for brand card glow */
export function getStreamingProviderBrandGlowShadow(providerId: number): string {
  return getStreamingProviderBrandTheme(providerId).base[0];
}

/** Visible outer ring on platform cards */
export function getStreamingProviderBrandRing(providerId: number): string {
  return getStreamingProviderBrandTheme(providerId).edge;
}
