import { FALLBACK_USER_REGION } from '../region-options';

export function getDeviceLocaleTag(): string | null {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale?.trim() ? locale.trim() : null;
  } catch {
    return null;
  }
}

export function parseRegionFromLocaleTag(localeTag: string | null | undefined): string | null {
  if (!localeTag) {
    return null;
  }

  const normalized = localeTag.trim().replaceAll('_', '-');
  const parts = normalized.split('-').filter((part) => part.length > 0);

  if (parts.length < 2) {
    return null;
  }

  const regionPart = parts[parts.length - 1];
  if (!/^[A-Za-z]{2}$/.test(regionPart)) {
    return null;
  }

  return regionPart.toUpperCase();
}

export function resolveDeviceRegion(localeTag?: string | null): string | null {
  const tag = localeTag ?? getDeviceLocaleTag();
  return parseRegionFromLocaleTag(tag);
}

export function resolveInitialRegionalPreference(
  savedRegion: string | null,
  localeTag?: string | null,
): { region: string; source: 'saved' | 'device' | 'fallback' } {
  if (savedRegion && /^[A-Z]{2}$/.test(savedRegion)) {
    return { region: savedRegion, source: 'saved' };
  }

  const deviceRegion = resolveDeviceRegion(localeTag);
  if (deviceRegion) {
    return { region: deviceRegion, source: 'device' };
  }

  return { region: FALLBACK_USER_REGION, source: 'fallback' };
}
