import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

describe('theme tokens', () => {
  it('defines poster layout presets with 2:3 ratio', () => {
    expect(layout.posterCarousel.width).toBe(120);
    expect(layout.posterCarousel.height).toBe(180);
    expect(layout.posterList.width).toBe(72);
    expect(layout.posterList.height).toBe(108);
    expect(layout.posterCarousel.height / layout.posterCarousel.width).toBe(1.5);
  });

  it('defines interaction and semantic color tokens', () => {
    expect(interaction.touchTarget).toBeGreaterThanOrEqual(44);
    expect(colors.accentTint12).toContain('229');
    expect(colors.progressTrack).toBeTruthy();
    expect(colors.progressInProgress).toBeTruthy();
    expect(colors.progressCompleted).toBeTruthy();
    expect(colors.danger).toBe(colors.error);
    expect(spacing.md).toBe(16);
  });
});
