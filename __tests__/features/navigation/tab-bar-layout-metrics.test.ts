import {
  resolveTabBarLayoutMetrics,
  TAB_BAR_PADDING_TOP,
  TAB_BAR_ROW_HEIGHT,
} from '@/features/navigation/tab-bar-layout-metrics';
import { spacing } from '@/theme/spacing';

describe('resolveTabBarLayoutMetrics', () => {
  it('uses runtime bottom inset as label clearance, not an extra stacked band', () => {
    const bottomInset = 34;
    const metrics = resolveTabBarLayoutMetrics({
      top: 44,
      bottom: bottomInset,
      left: 0,
      right: 0,
    });

    expect(metrics.paddingBottom).toBe(bottomInset);
    expect(metrics.labelBottomToShellBottom).toBe(bottomInset);
    expect(metrics.totalHeight).toBe(TAB_BAR_PADDING_TOP + TAB_BAR_ROW_HEIGHT + bottomInset);
    expect(metrics.rowHeight).toBe(TAB_BAR_ROW_HEIGHT);
  });

  it('does not add bottom inset twice to total height', () => {
    const bottomInset = 21;
    const metrics = resolveTabBarLayoutMetrics({
      top: 0,
      bottom: bottomInset,
      left: 0,
      right: 0,
    });

    expect(metrics.totalHeight - metrics.paddingBottom).toBe(
      TAB_BAR_PADDING_TOP + TAB_BAR_ROW_HEIGHT,
    );
  });

  it('falls back to minimal padding when bottom inset is zero', () => {
    const metrics = resolveTabBarLayoutMetrics({ top: 0, bottom: 0, left: 0, right: 0 });

    expect(metrics.paddingBottom).toBe(spacing.xs);
    expect(metrics.totalHeight).toBe(TAB_BAR_PADDING_TOP + TAB_BAR_ROW_HEIGHT + spacing.xs);
  });
});
