export const DEFAULT_RELEASE_REGION = 'TR';
export const FALLBACK_USER_REGION = DEFAULT_RELEASE_REGION;

export const REGION_OPTIONS: {
  code: string;
  label: string;
}[] = [
  { code: 'TR', label: 'Turkey' },
  { code: 'US', label: 'United States' },
  { code: 'GB', label: 'United Kingdom' },
  { code: 'DE', label: 'Germany' },
  { code: 'FR', label: 'France' },
  { code: 'ES', label: 'Spain' },
  { code: 'IT', label: 'Italy' },
  { code: 'NL', label: 'Netherlands' },
  { code: 'CA', label: 'Canada' },
  { code: 'AU', label: 'Australia' },
];

export function getRegionLabel(code: string): string {
  return REGION_OPTIONS.find((option) => option.code === code)?.label ?? code;
}

export function normalizeRegionCode(code: string | undefined | null): string {
  if (!code) {
    return DEFAULT_RELEASE_REGION;
  }

  const normalized = code.trim().toUpperCase();
  return normalized.length === 2 ? normalized : DEFAULT_RELEASE_REGION;
}
