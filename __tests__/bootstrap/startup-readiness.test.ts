import { Ionicons } from '@expo/vector-icons';
import {
  canRevealApplicationUi,
  preloadStartupIconFonts,
} from '@/bootstrap/startup-readiness';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: {
    loadFont: jest.fn(),
  },
}));

describe('startup-readiness', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('preloads Ionicons during bootstrap', async () => {
    (Ionicons.loadFont as jest.Mock).mockResolvedValue(undefined);

    await expect(preloadStartupIconFonts()).resolves.toEqual({ ok: true });
    expect(Ionicons.loadFont).toHaveBeenCalledTimes(1);
  });

  it('allows startup to continue when icon font preload fails', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const error = new Error('font load failed');
    (Ionicons.loadFont as jest.Mock).mockRejectedValue(error);

    await expect(preloadStartupIconFonts()).resolves.toEqual({ ok: false, error });
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it('does not reveal application UI before icon readiness', () => {
    expect(canRevealApplicationUi(false, false)).toBe(false);
    expect(canRevealApplicationUi(false, true)).toBe(false);
  });

  it('does not reveal application UI while auth bootstrap is loading', () => {
    expect(canRevealApplicationUi(true, true)).toBe(false);
  });

  it('reveals application UI only after icon readiness and auth bootstrap complete', () => {
    expect(canRevealApplicationUi(true, false)).toBe(true);
  });
});
