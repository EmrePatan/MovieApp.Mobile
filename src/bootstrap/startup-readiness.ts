import { Ionicons } from '@expo/vector-icons';

export interface StartupIconFontPreloadResult {
  ok: boolean;
  error?: unknown;
}

export async function preloadStartupIconFonts(): Promise<StartupIconFontPreloadResult> {
  try {
    await Ionicons.loadFont();
    return { ok: true };
  } catch (error) {
    console.warn('[Startup] Failed to preload Ionicons font. Continuing startup.', error);
    return { ok: false, error };
  }
}

export function canRevealApplicationUi(
  iconFontsReady: boolean,
  authIsLoading: boolean,
): boolean {
  return iconFontsReady && !authIsLoading;
}
