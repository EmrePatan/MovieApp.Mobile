import * as Haptics from 'expo-haptics';

/** Light tick for moving a selection (tab change, rating preview). */
export function hapticSelection(): void {
  void Haptics.selectionAsync().catch(() => undefined);
}

/** Confirmation for a completed action (rating saved). */
export function hapticSuccess(): void {
  void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

let lastStepKey: number | null = null;

/**
 * Selection tick only when the stepped value changes, e.g. while dragging across
 * rating stars. Pass `null` when the interaction ends so the next drag ticks again.
 */
export function hapticStep(key: number | null): void {
  if (key !== null && key !== lastStepKey) {
    hapticSelection();
  }
  lastStepKey = key;
}
