import type { TFunction } from 'i18next';

/** Canonical `TvShowDetailsResponse.status` values from the MovieApp API contract. */
const TV_SHOW_STATUS_I18N_KEYS: Record<string, string> = {
  'returning series': 'details.tvShowStatus.returningSeries',
  'in production': 'details.tvShowStatus.inProduction',
  ended: 'details.tvShowStatus.ended',
  canceled: 'details.tvShowStatus.canceled',
  cancelled: 'details.tvShowStatus.canceled',
  pilot: 'details.tvShowStatus.pilot',
  planned: 'details.tvShowStatus.planned',
};

export function resolveTvShowStatusTranslationKey(
  apiStatus: string | null | undefined,
): string | null {
  const normalized = apiStatus?.trim().toLowerCase();
  if (!normalized) {
    return null;
  }

  return TV_SHOW_STATUS_I18N_KEYS[normalized] ?? null;
}

export function translateTvShowStatus(
  apiStatus: string | null | undefined,
  t: TFunction,
): string | null {
  const key = resolveTvShowStatusTranslationKey(apiStatus);
  if (!key) {
    return null;
  }

  const translated = t(key);
  return translated === key ? null : translated;
}
