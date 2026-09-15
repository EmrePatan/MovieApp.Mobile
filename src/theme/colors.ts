/**
 * Semantic color tokens for MovieApp.
 *
 * accent*     — premium gold/amber product accent (ratings, active actions, highlights)
 * success*    — emerald completion / true success only
 * danger/error — red destructive and validation failures
 */
export const colors = {
  background: '#0A0A0F',
  surface: '#14141C',
  surfaceElevated: '#1C1C28',
  inputBackground: '#1A1A24',
  tabBar: '#0F0F16',
  tabBarBorder: '#222230',
  skeleton: '#1C1C28',
  overlay: 'rgba(0, 0, 0, 0.6)',

  textPrimary: '#F5F5F7',
  textSecondary: '#A1A1B5',
  textMuted: '#6B6B80',

  border: '#2A2A3A',
  borderAccent: 'rgba(196, 163, 90, 0.55)',
  borderSubtle: 'rgba(255, 255, 255, 0.12)',

  accent: '#C4A35A',
  accentStrong: '#D4B36A',
  accentMuted: '#9A8550',
  accentTint12: 'rgba(196, 163, 90, 0.12)',
  accentTint14: 'rgba(196, 163, 90, 0.14)',
  accentTint18: 'rgba(196, 163, 90, 0.18)',
  accentSurface: 'rgba(20, 20, 28, 0.72)',

  success: '#4CAF82',
  successTint12: 'rgba(76, 175, 130, 0.12)',
  successTint15: 'rgba(76, 175, 130, 0.15)',

  danger: '#E50914',
  dangerMuted: '#B20710',
  error: '#FF4D4F',
  errorTint15: 'rgba(255, 77, 79, 0.15)',

  warning: '#F5A623',

  progressTrack: '#2A2A38',
  progressInProgress: '#C4A35A',
  progressCompleted: '#4CAF82',
  progressCompletedTint12: 'rgba(76, 175, 130, 0.12)',

  libraryCompleted: '#9B7BD4',
  libraryCompletedTint12: 'rgba(155, 123, 212, 0.12)',
  libraryWatching: '#F5A623',
  libraryWatchingTint12: 'rgba(245, 166, 35, 0.12)',
} as const;
