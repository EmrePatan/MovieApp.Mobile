import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  translateAdvancedDiscoverMediaType,
  translateAdvancedDiscoverSort,
  translateDiscoverReleaseType,
  translateGenreName,
  translateWatchProviderType,
} from '@/i18n/catalog-labels';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import {
  CatalogChipRow,
  CatalogFilterSheetShell,
  CatalogOptionList,
  FilterSelectorRow,
} from '@/features/catalog/components';
import { getRegionFlagEmoji, getRegionLabel, REGION_OPTIONS } from '@/features/regions/region-options';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { MyPlatformsFilter } from '@/features/watch-platforms/MyPlatformsFilter';
import { useDiscoveryWatchProviders } from '../hooks/useDiscoveryWatchProviders';
import { useGenres } from '../hooks/useGenres';
import {
  isSupportedCertificationCountry,
  listCertificationOptions,
} from '../discover-certification-options';
import { DISCOVER_RELEASE_TYPE_OPTIONS } from '../discover-release-type-options';
import { CATALOG_MIN_RATING_OPTIONS } from '../catalog-filter-presets';
import {
  ADVANCED_DISCOVER_MEDIA_OPTIONS,
  ADVANCED_DISCOVER_SORT_OPTIONS,
  createDefaultAdvancedDiscoverFilters,
  ensureStreamingDraftDefaults,
  type AdvancedDiscoverFilters,
  type AdvancedDiscoverMediaType,
  type GenreMatchMode,
} from '../advanced-discover-types';
import { WATCH_MONETIZATION_OPTIONS, type WatchMonetizationType } from '../watch-provider-types';
import {
  CountryFilterList,
  flagEmojiForOriginCountry,
  formatFilterList,
  GenreFilterList,
  LanguageFilterList,
  RatingFilterList,
  RuntimeFilterPanel,
  useFilterSummaries,
  VoteCountFilterList,
  YearFilterPanel,
} from './filter-selectors';
import { WatchProviderLogo } from './WatchProviderLogo';
import { premiumSheet, premiumSheetChrome } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';

type SelectorKind =
  | 'genre'
  | 'year'
  | 'minRating'
  | 'maxRating'
  | 'voteCount'
  | 'runtime'
  | 'language'
  | 'country'
  | 'certificationCountry'
  | 'certification'
  | 'releaseTypes'
  | 'watchRegion'
  | 'providers'
  | 'watchType'
  | 'sort';

const MAX_RATING_OPTIONS: readonly (number | null)[] = [null, 5, 6, 7, 8, 9];
const maxRatingLabel = (rating: number) => `≤ ${rating}`;

interface AdvancedDiscoverFilterSheetProps {
  visible: boolean;
  mediaType: AdvancedDiscoverMediaType;
  filters: AdvancedDiscoverFilters;
  onClose: () => void;
  onApply: (mediaType: AdvancedDiscoverMediaType, filters: AdvancedDiscoverFilters) => void;
  onClear: () => void;
}

export function AdvancedDiscoverFilterSheet({
  visible,
  mediaType,
  filters,
  onClose,
  onApply,
  onClear,
}: AdvancedDiscoverFilterSheetProps) {
  const { t } = useTranslation();
  const genresQuery = useGenres();
  const genres = useMemo(() => genresQuery.data ?? [], [genresQuery.data]);
  const summaries = useFilterSummaries();
  const { anyLabel } = summaries;
  const wasVisibleRef = useRef(false);
  const [draftMediaType, setDraftMediaType] = useState<AdvancedDiscoverMediaType>(mediaType);
  const [draft, setDraft] = useState<AdvancedDiscoverFilters>(filters);
  const [selector, setSelector] = useState<SelectorKind | null>(null);
  const [yearPanelKey, setYearPanelKey] = useState(0);
  const { region: userRegion, isHydrated } = useRegionalPreference();
  const watchRegion = draft.watchRegion ?? userRegion;
  const certificationCountry = draft.certificationCountry ?? userRegion;
  const certificationOptions = listCertificationOptions(certificationCountry);
  const providersQuery = useDiscoveryWatchProviders(draftMediaType, watchRegion, isHydrated);
  const providers = providersQuery.data?.providers ?? [];

  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      setDraftMediaType(mediaType);
      setDraft(filters);
      setSelector(null);
    }

    wasVisibleRef.current = visible;
  }, [visible, filters, mediaType]);

  const updateDraft = (patch: Partial<AdvancedDiscoverFilters>) => {
    setDraft((current) => ({ ...current, ...patch }));
  };

  const closeSelector = () => setSelector(null);

  const handleApply = () => {
    onApply(draftMediaType, ensureStreamingDraftDefaults(draft, userRegion));
  };

  const handleClear = () => {
    setDraftMediaType('movie');
    setDraft(createDefaultAdvancedDiscoverFilters());
    setSelector(null);
    onClear();
  };

  const toggleProvider = (providerIds: number[]) => {
    const added = providerIds.length > draft.watchProviderIds.length;
    updateDraft({
      watchProviderIds: providerIds,
      // Picking a platform without a watch type means subscription.
      watchMonetizationTypes:
        added && draft.watchMonetizationTypes.length === 0
          ? ['stream']
          : draft.watchMonetizationTypes,
    });
  };

  const certificationLabel =
    certificationOptions.find((option) => option.value === draft.certification)?.label ??
    draft.certification ??
    anyLabel;
  const genreSummary = formatFilterList(
    draft.genreIds.map((id) => {
      const genre = genres.find((entry) => entry.id === id);
      return genre
        ? translateGenreName(genre.name)
        : t('discovery.activeFilterChips.genreFallback');
    }),
    anyLabel,
  );
  const providerSummary = formatFilterList(
    draft.watchProviderIds.map(
      (id) => providers.find((provider) => provider.providerId === id)?.name ?? String(id),
    ),
    anyLabel,
  );
  const releaseTypeSummary = formatFilterList(
    draft.releaseTypes.map((type) => translateDiscoverReleaseType(type)),
    anyLabel,
  );
  const watchTypeSummary = formatFilterList(
    draft.watchMonetizationTypes.map((type) => translateWatchProviderType(type)),
    anyLabel,
  );
  const sort = draft.sort ?? 'popularity_desc';

  const rows: {
    kind: SelectorKind;
    label: string;
    value: string;
    flagEmoji?: string;
    movieOnly?: boolean;
    testID?: string;
  }[] = [
    { kind: 'genre', label: t('common.genre'), value: genreSummary },
    { kind: 'year', label: t('common.year'), value: summaries.year(draft) },
    {
      kind: 'certificationCountry',
      label: t('discovery.advancedDiscover.certificationCountry'),
      value: getRegionLabel(certificationCountry),
      flagEmoji: getRegionFlagEmoji(certificationCountry),
      movieOnly: true,
    },
    {
      kind: 'certification',
      label: t('discovery.advancedDiscover.certificationSection'),
      value: certificationLabel,
      movieOnly: true,
    },
    {
      kind: 'releaseTypes',
      label: t('discovery.advancedDiscover.releaseTypeSection'),
      value: releaseTypeSummary,
      movieOnly: true,
    },
    { kind: 'minRating', label: t('common.minimumRating'), value: summaries.rating(draft.minRating) },
    {
      kind: 'maxRating',
      label: t('common.maximumRating'),
      value: draft.maxRating != null ? maxRatingLabel(draft.maxRating) : anyLabel,
    },
    {
      kind: 'voteCount',
      label: t('discovery.catalogFilters.minVoteCount'),
      value: summaries.voteCount(draft.minVoteCount),
    },
    { kind: 'runtime', label: t('discovery.catalogFilters.runtime'), value: summaries.runtime(draft) },
    {
      kind: 'language',
      label: t('common.originalLanguage'),
      value: summaries.language(draft.originalLanguage),
    },
    {
      kind: 'country',
      label: t('common.originCountry'),
      value: summaries.country(draft.originCountry),
      flagEmoji: flagEmojiForOriginCountry(draft.originCountry),
    },
    {
      kind: 'watchRegion',
      label: t('discovery.streamingDiscover.watchRegion'),
      value: getRegionLabel(watchRegion),
      flagEmoji: getRegionFlagEmoji(watchRegion),
      testID: 'watch-region-selector',
    },
    { kind: 'providers', label: t('extras.filterPlatforms'), value: providerSummary },
    { kind: 'watchType', label: t('extras.filterWatchType'), value: watchTypeSummary },
    {
      kind: 'sort',
      label: t('discovery.filterSheet.sortSection'),
      value: translateAdvancedDiscoverSort(sort),
    },
  ];

  const regionOptions = REGION_OPTIONS.map((option) => ({
    value: option.code,
    label: getRegionLabel(option.code),
    flagEmoji: getRegionFlagEmoji(option.code),
  }));

  const renderSelectorContent = (kind: SelectorKind) => {
    switch (kind) {
      case 'genre':
        return (
          <>
            {draft.genreIds.length > 1 ? (
              <CatalogChipRow<GenreMatchMode>
                options={(['all', 'any'] as GenreMatchMode[]).map((mode) => ({
                  value: mode,
                  label: t(`discovery.advancedDiscover.genreMatch.${mode}`),
                }))}
                value={draft.genreMatch}
                onChange={(genreMatch) => updateDraft({ genreMatch })}
              />
            ) : null}
            <GenreFilterList
              genres={genres}
              isLoading={genresQuery.isLoading}
              selectedIds={draft.genreIds}
              onChange={(genreIds) => updateDraft({ genreIds })}
            />
          </>
        );
      case 'year':
        return <YearFilterPanel key={yearPanelKey} value={draft} onChange={updateDraft} />;
      case 'minRating':
        return (
          <RatingFilterList
            value={draft.minRating}
            ratings={CATALOG_MIN_RATING_OPTIONS.filter(
              (rating) => rating == null || draft.maxRating == null || rating <= draft.maxRating,
            )}
            onChange={(minRating) => updateDraft({ minRating })}
            onComplete={closeSelector}
          />
        );
      case 'maxRating':
        return (
          <RatingFilterList
            value={draft.maxRating}
            ratings={MAX_RATING_OPTIONS.filter(
              (rating) => rating == null || draft.minRating == null || rating >= draft.minRating,
            )}
            labelFor={maxRatingLabel}
            onChange={(maxRating) => updateDraft({ maxRating })}
            onComplete={closeSelector}
          />
        );
      case 'voteCount':
        return (
          <VoteCountFilterList
            value={draft.minVoteCount}
            onChange={(minVoteCount) => updateDraft({ minVoteCount })}
            onComplete={closeSelector}
          />
        );
      case 'runtime':
        return <RuntimeFilterPanel value={draft} onChange={updateDraft} />;
      case 'language':
        return (
          <LanguageFilterList
            value={draft.originalLanguage}
            onChange={(originalLanguage) => updateDraft({ originalLanguage })}
            onComplete={closeSelector}
          />
        );
      case 'country':
        return (
          <CountryFilterList
            value={draft.originCountry}
            onChange={(originCountry) => updateDraft({ originCountry })}
            onComplete={closeSelector}
          />
        );
      case 'certificationCountry':
        return (
          <CatalogOptionList
            values={[certificationCountry]}
            options={regionOptions}
            onChange={(values) => {
              const next = values[0];
              if (next) {
                updateDraft({ certificationCountry: next, certification: null });
              }
            }}
            onSingleSelectComplete={closeSelector}
          />
        );
      case 'certification':
        return isSupportedCertificationCountry(certificationCountry) ? (
          <CatalogOptionList
            values={[draft.certification ?? '']}
            options={[{ value: '', label: anyLabel }, ...certificationOptions]}
            onChange={(values) =>
              updateDraft({ certificationCountry, certification: values[0] || null })
            }
            onSingleSelectComplete={closeSelector}
          />
        ) : (
          <AppText variant="bodySmall" muted>
            {t('discovery.advancedDiscover.certificationUnavailable')}
          </AppText>
        );
      case 'releaseTypes':
        return (
          <CatalogOptionList
            multi
            values={draft.releaseTypes}
            options={DISCOVER_RELEASE_TYPE_OPTIONS.map((option) => ({
              value: option.value,
              label: translateDiscoverReleaseType(option.value),
            }))}
            onChange={(releaseTypes) => updateDraft({ releaseTypes })}
          />
        );
      case 'watchRegion':
        return (
          <CatalogOptionList
            values={[watchRegion]}
            options={regionOptions}
            onChange={(values) => {
              if (values[0]) {
                updateDraft({ watchRegion: values[0] });
              }
            }}
            onSingleSelectComplete={closeSelector}
          />
        );
      case 'providers':
        if (providersQuery.isLoading) {
          return <ActivityIndicator color={premiumSheet.mutedGold} />;
        }

        if (providersQuery.isError || providers.length === 0) {
          return (
            <ErrorView
              message={t('discovery.streamingDiscover.providersLoadError')}
              onRetry={() => void providersQuery.refetch()}
              retryLabel={t('common.tryAgain')}
            />
          );
        }

        return (
          <CatalogOptionList
            multi
            values={draft.watchProviderIds.map(String)}
            options={providers.map((provider) => ({
              value: String(provider.providerId),
              label: provider.name,
              leading: (
                <WatchProviderLogo
                  provider={provider}
                  selected={draft.watchProviderIds.includes(provider.providerId)}
                />
              ),
            }))}
            onChange={(values) => toggleProvider(values.map(Number))}
            testID="discovery-provider-list"
          />
        );
      case 'watchType':
        return (
          <CatalogOptionList<WatchMonetizationType>
            multi
            values={draft.watchMonetizationTypes}
            options={WATCH_MONETIZATION_OPTIONS.map((type) => ({
              value: type,
              label: translateWatchProviderType(type),
            }))}
            onChange={(watchMonetizationTypes) => updateDraft({ watchMonetizationTypes })}
          />
        );
      case 'sort':
        return (
          <CatalogOptionList
            values={[sort]}
            options={ADVANCED_DISCOVER_SORT_OPTIONS.map((option) => ({
              value: option,
              label: translateAdvancedDiscoverSort(option),
            }))}
            onChange={(values) => {
              if (values[0]) {
                updateDraft({ sort: values[0] });
              }
            }}
            onSingleSelectComplete={closeSelector}
          />
        );
    }
  };

  const inSelector = selector != null;
  const showSelectorFooter = selector === 'year' || selector === 'runtime';
  const selectedRow = rows.find((row) => row.kind === selector);

  return (
    <CatalogFilterSheetShell
      visible={visible}
      title={selectedRow?.label ?? t('discovery.advancedDiscover.sheetTitle')}
      headerAction={inSelector ? 'back' : 'close'}
      headerActionLabel={inSelector ? t('common.back') : t('common.close')}
      onHeaderAction={inSelector ? closeSelector : onClose}
      resetLabel={
        showSelectorFooter ? t('discovery.catalogFilters.any') : t('discovery.filterSheet.reset')
      }
      applyLabel={
        showSelectorFooter
          ? t('discovery.catalogFilters.done')
          : t('discovery.filterSheet.showResults')
      }
      onReset={
        showSelectorFooter
          ? () => {
              if (selector === 'year') {
                // Remount so the panel drops its custom-range mode.
                setYearPanelKey((key) => key + 1);
                updateDraft({ year: null, yearFrom: null, yearTo: null });
              } else {
                updateDraft({ minRuntimeMinutes: null, maxRuntimeMinutes: null });
              }
            }
          : handleClear
      }
      onApply={showSelectorFooter ? closeSelector : handleApply}
      testID="advanced-discover-filter-sheet"
    >
      {selector != null ? (
        renderSelectorContent(selector)
      ) : (
        <>
          <View style={styles.section}>
            <AppText variant="bodySmall" style={premiumSheetChrome.sectionLabel}>
              {t('discovery.advancedDiscover.mediaTypeSection')}
            </AppText>
            <CatalogChipRow
              options={ADVANCED_DISCOVER_MEDIA_OPTIONS.map((option) => ({
                value: option,
                label: translateAdvancedDiscoverMediaType(option),
              }))}
              value={draftMediaType}
              accessibilityLabelFor={(label) => t('common.mediaTypeLabel', { label })}
              onChange={(nextType) => {
                setDraftMediaType(nextType);
                updateDraft({
                  genreIds: [],
                  watchProviderIds: [],
                  certification: null,
                  certificationCountry: null,
                  releaseTypes: [],
                });
              }}
            />
          </View>

          <MyPlatformsFilter
            availableProviders={providersQuery.data?.providers}
            selectedProviderIds={draft.watchProviderIds}
            onChoose={onClose}
            onChange={(watchProviderIds) =>
              updateDraft({
                watchProviderIds,
                // A subscription means streaming, so rent and buy are not mixed in.
                watchMonetizationTypes: watchProviderIds.length > 0 ? ['stream'] : [],
              })
            }
          />

          {rows
            .filter((row) => !row.movieOnly || draftMediaType === 'movie')
            .map((row) => (
              <FilterSelectorRow
                key={row.kind}
                label={row.label}
                valueLabel={row.value}
                valueFlagEmoji={row.flagEmoji}
                onPress={() => setSelector(row.kind)}
                testID={row.testID}
              />
            ))}
        </>
      )}
    </CatalogFilterSheetShell>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
