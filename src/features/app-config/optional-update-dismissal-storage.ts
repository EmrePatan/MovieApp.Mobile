import * as SecureStore from 'expo-secure-store';

const OPTIONAL_UPDATE_DISMISSAL_KEY = 'movieapp.optionalUpdateDismissal.v1';

export const OPTIONAL_UPDATE_REMINDER_MS = 24 * 60 * 60 * 1000;

interface OptionalUpdateDismissalRecord {
  latestBuild: number;
  dismissedAt: number;
}

export async function loadOptionalUpdateDismissal(): Promise<OptionalUpdateDismissalRecord | null> {
  const raw = await SecureStore.getItemAsync(OPTIONAL_UPDATE_DISMISSAL_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as OptionalUpdateDismissalRecord;
    if (
      typeof parsed.latestBuild !== 'number' ||
      typeof parsed.dismissedAt !== 'number' ||
      parsed.latestBuild < 0
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export async function saveOptionalUpdateDismissal(latestBuild: number): Promise<void> {
  const record: OptionalUpdateDismissalRecord = {
    latestBuild,
    dismissedAt: Date.now(),
  };

  await SecureStore.setItemAsync(OPTIONAL_UPDATE_DISMISSAL_KEY, JSON.stringify(record));
}

export function shouldShowOptionalUpdateAfterDismissal(
  latestBuild: number,
  dismissal: OptionalUpdateDismissalRecord | null,
  nowMs: number = Date.now(),
): boolean {
  if (!dismissal) {
    return true;
  }

  if (dismissal.latestBuild !== latestBuild) {
    return true;
  }

  return nowMs - dismissal.dismissedAt >= OPTIONAL_UPDATE_REMINDER_MS;
}
