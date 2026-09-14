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
    expect(colors.accent).toBe('#C4A35A');
    expect(colors.accentStrong).toBe('#D4B36A');
    expect(colors.accentTint12).toContain('196');
    expect(colors.danger).toBe('#E50914');
    expect(colors.success).toBe(colors.progressCompleted);
    expect(colors.progressInProgress).toBe(colors.accent);
    expect(colors.progressTrack).toBeTruthy();
    expect(spacing.md).toBe(16);
  });
});
