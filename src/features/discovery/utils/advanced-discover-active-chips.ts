import { i18n } from '@/i18n';
import {
  translateAdvancedDiscoverRuntimePreset,
  translateAdvancedDiscoverSort,
  translateDiscoverReleaseType,
  translateGenreName,
} from '@/i18n/catalog-labels';
import type { ActiveFilterChip } from '../components/ActiveFilterChips';
import type {
  AdvancedDiscoverFilters,
  AdvancedDiscoverMediaType,
  AdvancedDiscoverState,
} from '../advanced-discover-types';
import { ADVANCED_DISCOVER_RUNTIME_PRESETS } from '../advanced-discover-types';
import type { Genre } from '../types';
import type { DiscoveryWatchProvider } from '../watch-provider-types';
function runtimePresetLabel(filters: AdvancedDiscoverFilters): string | null {
  const preset = ADVANCED_DISCOVER_RUNTIME_PRESETS.find(
    (entry) =>
      entry.minRuntimeMinutes === filters.minRuntimeMinutes &&
      entry.maxRuntimeMinutes === filters.maxRuntimeMinutes,
  );

  if (preset && preset.key !== 'any') {
    return translateAdvancedDiscoverRuntimePreset(preset.key);
  }

  if (filters.minRuntimeMinutes != null || filters.maxRuntimeMinutes != null) {
    if (filters.minRuntimeMinutes != null && filters.maxRuntimeMinutes != null) {
      return i18n.t('discovery.advancedDiscover.activeChips.runtimeRange', {
        min: filters.minRuntimeMinutes,
        max: filters.maxRuntimeMinutes,
      });
    }

    if (filters.maxRuntimeMinutes != null) {
      return i18n.t('discovery.advancedDiscover.activeChips.runtimeMax', {
        max: filters.maxRuntimeMinutes,
      });
    }

    return i18n.t('discovery.advancedDiscover.activeChips.runtimeMin', {
      min: filters.minRuntimeMinutes,
    });
  }

  return null;
}

export function buildAdvancedDiscoverActiveFilterChips(
  state: AdvancedDiscoverState,
  genres: Genre[],
  providers: DiscoveryWatchProvider[],
  handlers: {
    onUpdate: (next: AdvancedDiscoverState) => void;
  },
): ActiveFilterChip[] {
  const { mediaType, filters } = state;
  const chips: ActiveFilterChip[] = [];
  const genreNameById = new Map(genres.map((genre) => [genre.id, genre.name]));
  const providerNameById = new Map(providers.map((provider) => [provider.providerId, provider.name]));

  const patchFilters = (patch: Partial<AdvancedDiscoverFilters>) => {
    handlers.onUpdate({
      mediaType,
      filters: { ...filters, ...patch },
    });
  };

  if (mediaType !== 'movie') {
    chips.push({
      key: 'mediaType',
      label: i18n.t(`discovery.advancedDiscover.mediaOptions.${mediaType}`),
      onRemove: () => handlers.onUpdate({ mediaType: 'movie', filters }),
    });
  }

  for (const genreId of filters.genreIds) {
    const name = genreNameById.get(genreId);
    chips.push({
      key: `genre-${genreId}`,
      label: name ? translateGenreName(name) : i18n.t('discovery.activeFilterChips.genreFallback'),
      onRemove: () =>
        patchFilters({
          genreIds: filters.genreIds.filter((id) => id !== genreId),
        }),
    });
  }

  if (filters.genreIds.length > 1 && filters.genreMatch === 'any') {
    chips.push({
      key: 'genreMatch',
      label: i18n.t('discovery.advancedDiscover.activeChips.genreMatchAny'),
      onRemove: () => patchFilters({ genreMatch: 'all' }),
    });
  }

  if (filters.year != null) {
    chips.push({
      key: 'year',
      label: i18n.t('discovery.activeFilterChips.year', { year: filters.year }),
      onRemove: () => patchFilters({ year: null }),
    });
  }

  if (filters.yearFrom != null || filters.yearTo != null) {
    chips.push({
      key: 'yearRange',
      label: i18n.t('discovery.advancedDiscover.activeChips.yearRange', {
        from: filters.yearFrom ?? '…',
        to: filters.yearTo ?? '…',
      }),
      onRemove: () => patchFilters({ yearFrom: null, yearTo: null }),
    });
  }

  if (filters.minRating != null) {
    chips.push({
      key: 'minRating',
      label: i18n.t('discovery.activeFilterChips.rating', { rating: filters.minRating }),
      onRemove: () => patchFilters({ minRating: null }),
    });
  }

  if (filters.maxRating != null) {
    chips.push({
      key: 'maxRating',
      label: i18n.t('discovery.advancedDiscover.activeChips.maxRating', {
        rating: filters.maxRating,
      }),
      onRemove: () => patchFilters({ maxRating: null }),
    });
  }

  if (filters.minVoteCount != null) {
    chips.push({
      key: 'minVoteCount',
      label: i18n.t('discovery.advancedDiscover.activeChips.voteCount', {
        count: filters.minVoteCount,
      }),
      onRemove: () => patchFilters({ minVoteCount: null }),
    });
  }

  const runtimeLabel = runtimePresetLabel(filters);
  if (runtimeLabel) {
    chips.push({
      key: 'runtime',
      label: runtimeLabel,
      onRemove: () => patchFilters({ minRuntimeMinutes: null, maxRuntimeMinutes: null }),
    });
  }

  if (filters.certification) {
    chips.push({
      key: 'certification',
      label: i18n.t('discovery.advancedDiscover.activeChips.certification', {
        rating: filters.certification,
        country: filters.certificationCountry ?? '',
      }),
      onRemove: () => patchFilters({ certification: null, certificationCountry: null }),
    });
  }

  for (const releaseType of filters.releaseTypes) {
    chips.push({
      key: `release-${releaseType}`,
      label: translateDiscoverReleaseType(releaseType),
      onRemove: () =>
        patchFilters({
          releaseTypes: filters.releaseTypes.filter((entry) => entry !== releaseType),
        }),
    });
  }

  if (filters.watchRegion) {
    chips.push({
      key: 'watchRegion',
      label: i18n.t('discovery.advancedDiscover.activeChips.watchRegion', {
        region: filters.watchRegion,
      }),
      onRemove: () => patchFilters({ watchRegion: null }),
    });
  }

  for (const providerId of filters.watchProviderIds) {
    chips.push({
      key: `provider-${providerId}`,
      label: providerNameById.get(providerId) ?? i18n.t('discovery.advancedDiscover.activeChips.provider'),
      onRemove: () =>
        patchFilters({
          watchProviderIds: filters.watchProviderIds.filter((id) => id !== providerId),
        }),
    });
  }

  for (const monetizationType of filters.watchMonetizationTypes) {
    chips.push({
      key: `monetization-${monetizationType}`,
      label: i18n.t(`discovery.watchProviders.monetization.${monetizationType}`),
      onRemove: () =>
        patchFilters({
          watchMonetizationTypes: filters.watchMonetizationTypes.filter(
            (entry) => entry !== monetizationType,
          ),
        }),
    });
  }

  if (filters.originalLanguage) {
    chips.push({
      key: 'language',
      label: i18n.t('discovery.advancedDiscover.activeChips.language', {
        language: filters.originalLanguage,
      }),
      onRemove: () => patchFilters({ originalLanguage: null }),
    });
  }

  if (filters.originCountry) {
    chips.push({
      key: 'originCountry',
      label: i18n.t('discovery.advancedDiscover.activeChips.originCountry', {
        country: filters.originCountry,
      }),
      onRemove: () => patchFilters({ originCountry: null }),
    });
  }

  if (filters.sort && filters.sort !== 'popularity_desc') {
    chips.push({
      key: 'sort',
      label: translateAdvancedDiscoverSort(filters.sort),
      onRemove: () => patchFilters({ sort: 'popularity_desc' }),
    });
  }

  return chips;
}
