import { countryCodeToFlagEmoji } from '@/features/discovery/utils/country-flag';
import { getUiFormatLocaleTag } from '@/i18n';

export const DEFAULT_RELEASE_REGION = 'TR';
export const FALLBACK_USER_REGION = DEFAULT_RELEASE_REGION;

export const REGION_OPTIONS: {
  code: string;
}[] = [
  { code: 'TR' },
  { code: 'US' },
  { code: 'GB' },
  { code: 'DE' },
  { code: 'FR' },
  { code: 'ES' },
  { code: 'IT' },
  { code: 'NL' },
  { code: 'CA' },
  { code: 'AU' },
];

export function getRegionLabel(code: string, formatLocaleTag?: string): string {
  const normalizedCode = normalizeRegionCode(code);
  const locale = formatLocaleTag ?? getUiFormatLocaleTag();

  try {
    const displayNames = new Intl.DisplayNames([locale], { type: 'region' });
    const localized = displayNames.of(normalizedCode);
    if (localized) {
      return localized;
    }
  } catch {
    // Fall back to the region code when Intl is unavailable.
  }

  return normalizedCode;
}

export function normalizeRegionCode(code: string | undefined | null): string {
  if (!code) {
    return DEFAULT_RELEASE_REGION;
  }

  const normalized = code.trim().toUpperCase();
  return normalized.length === 2 ? normalized : DEFAULT_RELEASE_REGION;
}

export function getRegionFlagEmoji(code: string): string {
  return countryCodeToFlagEmoji(normalizeRegionCode(code));
}
