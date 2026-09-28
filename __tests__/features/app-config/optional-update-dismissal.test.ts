import {
  OPTIONAL_UPDATE_REMINDER_MS,
  shouldShowOptionalUpdateAfterDismissal,
} from '@/features/app-config/optional-update-dismissal-storage';

describe('shouldShowOptionalUpdateAfterDismissal', () => {
  const now = Date.UTC(2026, 0, 15, 12, 0, 0);

  it('shows when there is no dismissal record', () => {
    expect(shouldShowOptionalUpdateAfterDismissal(12, null, now)).toBe(true);
  });

  it('hides when the same latestBuild was dismissed recently', () => {
    expect(
      shouldShowOptionalUpdateAfterDismissal(
        12,
        { latestBuild: 12, dismissedAt: now - 1_000 },
        now,
      ),
    ).toBe(false);
  });

  it('shows again after 24 hours for the same latestBuild', () => {
    expect(
      shouldShowOptionalUpdateAfterDismissal(
        12,
        { latestBuild: 12, dismissedAt: now - OPTIONAL_UPDATE_REMINDER_MS },
        now,
      ),
    ).toBe(true);
  });

  it('shows when latestBuild changes', () => {
    expect(
      shouldShowOptionalUpdateAfterDismissal(
        13,
        { latestBuild: 12, dismissedAt: now - 1_000 },
        now,
      ),
    ).toBe(true);
  });
});
