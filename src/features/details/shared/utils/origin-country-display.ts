import { translateOriginCountryLabel } from '@/i18n/catalog-labels';
import { countryCodeToFlagEmoji } from '@/features/discovery/utils/country-flag';

export const MAX_ORIGIN_COUNTRY_DISPLAY = 2;

export type ResolvedOriginCountry = {
  code: string;
  emoji: string;
  label: string;
};

export function resolveOriginCountries(
  countryCodes: readonly string[] | null | undefined,
): ResolvedOriginCountry[] {
  if (!countryCodes?.length) {
    return [];
  }

  const seen = new Set<string>();
  const resolved: ResolvedOriginCountry[] = [];

  for (const raw of countryCodes) {
    if (resolved.length >= MAX_ORIGIN_COUNTRY_DISPLAY) {
      break;
    }

    const code = raw.trim().toUpperCase();
    if (code.length !== 2 || seen.has(code)) {
      continue;
    }

    const emoji = countryCodeToFlagEmoji(code);
    if (!emoji) {
      continue;
    }

    seen.add(code);
    resolved.push({
      code,
      emoji,
      label: translateOriginCountryLabel(code),
    });
  }

  return resolved;
}
