import { getUiFormatLocaleTag, i18n } from '@/i18n';
import { formatIsoDate } from '@/utils/format';
import type { DetailExtras } from '../types/detail-extras';

export interface DetailFact {
  label: string;
  value: string;
  /** Takes a whole row of the grid: lists and long values. */
  wide: boolean;
}

/** Only the user's own region counts: another country's rating would mislead. */
export function resolveCertification(
  extras: DetailExtras | null | undefined,
  region: string,
): string | null {
  return extras?.certifications[region.toUpperCase()] ?? null;
}

/** "$165 Mn" style. Written by hand: compact number formatting is not reliable on Hermes. */
function formatUsd(amount: number): string {
  const locale = getUiFormatLocaleTag();
  const [divisor, key] =
    amount >= 1_000_000_000
      ? [1_000_000_000, 'billion']
      : amount >= 1_000_000
        ? [1_000_000, 'million']
        : [1, null];
  const number = (amount / divisor).toLocaleString(locale, { maximumFractionDigits: 1 });

  return key ? `$${i18n.t(`details.facts.${key}`, { value: number })}` : `$${number}`;
}

export function buildDetailFacts(extras: DetailExtras | null | undefined): DetailFact[] {
  if (!extras) {
    return [];
  }

  const episode = extras.lastEpisode;
  const lastEpisode = episode
    ? [
        i18n.t('details.metadata.episodeDetail', {
          season: episode.seasonNumber,
          episode: episode.episodeNumber,
        }),
        formatIsoDate(episode.airDate),
      ]
        .filter(Boolean)
        .join(' · ')
    : null;

  // Order is the reading order of the grid.
  const rows: [key: string, value: string | null, wide: boolean][] = [
    ['budget', extras.budget ? formatUsd(extras.budget) : null, false],
    ['revenue', extras.revenue ? formatUsd(extras.revenue) : null, false],
    ['network', extras.networks.join(' · '), false],
    ['creator', extras.creators.join(' · '), false],
    ['lastEpisode', lastEpisode, true],
    ['production', extras.productionCompanies.join(' · '), true],
  ];

  return rows.flatMap(([key, value, wide]) =>
    value ? [{ label: i18n.t(`details.facts.${key}`), value, wide }] : [],
  );
}
