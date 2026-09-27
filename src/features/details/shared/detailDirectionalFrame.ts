import type { LinearGradientProps } from 'expo-linear-gradient';
import { colors } from '@/theme/colors';

export const DETAIL_DIRECTIONAL_FRAME_BORDER = 1;

export type DetailDirectionalFrameVariant = 'gold' | 'neutral';

type FrameGradient = Pick<LinearGradientProps, 'colors' | 'locations' | 'start' | 'end'>;

export const detailDirectionalFrameGradient: Record<DetailDirectionalFrameVariant, FrameGradient> =
  {
    gold: {
      colors: [
        'rgba(248, 232, 190, 1)',
        'rgba(220, 190, 125, 0.72)',
        'rgba(196, 163, 90, 0.14)',
        'rgba(196, 163, 90, 0.03)',
      ],
      locations: [0, 0.18, 0.55, 1],
      start: { x: 0, y: 0.25 },
      end: { x: 1, y: 0.75 },
    },
    neutral: {
      colors: [
        'rgba(210, 210, 224, 0.38)',
        'rgba(120, 120, 140, 0.28)',
        'rgba(72, 72, 88, 0.14)',
        'rgba(48, 48, 62, 0.06)',
      ],
      locations: [0, 0.2, 0.55, 1],
      start: { x: 0, y: 0.25 },
      end: { x: 1, y: 0.75 },
    },
  };

export const detailDirectionalFrameGoldGlow = {
  shadowColor: colors.accent,
  shadowOffset: { width: -5, height: 0 },
  shadowOpacity: 0.26,
  shadowRadius: 9,
  elevation: 4,
} as const;
