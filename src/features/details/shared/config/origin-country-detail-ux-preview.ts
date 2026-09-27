/**
 * Dev-only mock codes for poster origin flags until API exposes origin countries.
 * Set to null to hide. Production builds always null.
 */
export const ORIGIN_COUNTRY_UX_PREVIEW_CODES: readonly string[] | null = __DEV__
  ? ['US']
  : null;

/** @deprecated Use ORIGIN_COUNTRY_UX_PREVIEW_CODES */
export const POSTER_ORIGIN_FLAG_UX_PREVIEW = ORIGIN_COUNTRY_UX_PREVIEW_CODES;
