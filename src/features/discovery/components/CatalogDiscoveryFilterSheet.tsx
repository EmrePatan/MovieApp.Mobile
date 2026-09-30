import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppInput } from '@/components/inputs/AppInput';
import { AppText } from '@/components/common/AppText';
import { translateGenreName } from '@/i18n/catalog-labels';
import {
  CatalogChipRow,
  CatalogFilterSheetShell,
  CatalogKeywordSelector,
  CatalogOptionSelector,
  ExpandableAdvancedFilters,
  FilterSelectorRow,
} from '@/features/catalog/components';
import {
  CATALOG_MIN_RATING_OPTIONS,
  CATALOG_RUNTIME_PRESETS,
  CATALOG_VOTE_COUNT_OPTIONS,
  CATALOG_YEAR_PRESETS,
  resolveCatalogRuntimePresetKey,
  resolveCatalogYearPresetKey,
  type CatalogRuntimePresetKey,
  type CatalogYearPresetKey,
} from '../catalog-filter-presets';
import { CATALOG_LANGUAGE_OPTIONS } from '../catalog-language-options';
import { useGenres } from '../hooks/useGenres';
import { getOriginCountryOptions } from '../world-cinema-collections';
import { TV_DISCOVER_STATUS_OPTIONS, type TvDiscoverStatus } from '../tv-discover-status';
import {
  clearTvStatusesIfNeeded,
  hasAdvancedCatalogFiltersActive,
  shouldShowTvStatus,
  type CatalogContentType,
  type CatalogFilterDraft,
  type CatalogFilterField,
  type CatalogFilterSheetConfig,
} from '../utils/catalog-filter-draft';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

type SelectorKind =
  | 'genre'
  | 'year'
  | 'rating'
  | 'language'
  | 'country'
  | 'runtime'
  | 'voteCount'
  | 'keywords'
  | 'tvStatus'
  | null;

interface CatalogDiscoveryFilterSheetProps {
  visible: boolean;
  draft: CatalogFilterDraft;
  config: CatalogFilterSheetConfig;
  onClose: () => void;
  onApply: (draft: CatalogFilterDraft) => void;
  onReset: () => void;
  testID?: string;
}

function formatList(values: string[], fallback: string): string {
  if (values.length === 0) {
    return fallback;
  }

  if (values.length <= 2) {
    return values.join(', ');
  }

  return `${values.slice(0, 2).join(', ')} +${values.length - 2}`;
}

export function CatalogDiscoveryFilterSheet(props: CatalogDiscoveryFilterSheetProps) {
  if (!props.visible) {
    return null;
  }

  return <CatalogDiscoveryFilterSheetBody {...props} />;
}

function CatalogDiscoveryFilterSheetBody({
  visible,
  draft: appliedDraft,
  config,
  onClose,
  onApply,
  onReset,
  testID,
}: CatalogDiscoveryFilterSheetProps) {
  const { t } = useTranslation();
  const genresQuery = useGenres();
  const wasVisibleRef = useRef(false);
  const [draft, setDraft] = useState<CatalogFilterDraft>(appliedDraft);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const [selector, setSelector] = useState<SelectorKind>(null);
  const [yearMode, setYearMode] = useState<CatalogYearPresetKey>('any');
  const [runtimeMode, setRuntimeMode] = useState<CatalogRuntimePresetKey>('any');

  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      setDraft(appliedDraft);
      setAdvancedExpanded(false);
      setSelector(null);
      setYearMode(resolveCatalogYearPresetKey(appliedDraft));
      setRuntimeMode(resolveCatalogRuntimePresetKey(appliedDraft));
    }

    wasVisibleRef.current = visible;
  }, [visible, appliedDraft]);

  const anyLabel = t('discovery.catalogFilters.any');
  const genres = useMemo(() => genresQuery.data ?? [], [genresQuery.data]);
  const countryOptions = useMemo(() => getOriginCountryOptions(), []);

  const genreNamesById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const genre of genres) {
      map[genre.id] = translateGenreName(genre.name);
    }
    return map;
  }, [genres]);

  const updateDraft = (patch: Partial<CatalogFilterDraft>) => {
    setDraft((current) => clearTvStatusesIfNeeded({ ...current, ...patch }));
  };

  const contentTypeLabel = (type: CatalogContentType) => {
    switch (type) {
      case 'movie':
        return t('discovery.typeOptions.movie');
      case 'tv':
        return t('discovery.typeOptions.tv');
      default:
        return t('discovery.typeOptions.all');
    }
  };

  const yearSummary = () => {
    if (draft.year != null) {
      return String(draft.year);
    }

    if (draft.yearFrom != null || draft.yearTo != null) {
      return `${draft.yearFrom ?? '…'}–${draft.yearTo ?? '…'}`;
    }

    return anyLabel;
  };

  const ratingSummary = () =>
    draft.minRating != null
      ? t('discovery.catalogFilters.ratingOption', { rating: draft.minRating })
      : anyLabel;

  const languageSummary = () => {
    if (!draft.originalLanguage) {
      return anyLabel;
    }

    return t(`discovery.catalogFilters.languageNames.${draft.originalLanguage}`, {
      defaultValue: draft.originalLanguage,
    });
  };

  const countrySummary = () => {
    if (!draft.originCountry) {
      return anyLabel;
    }

    const match = countryOptions.find((option) => option.code === draft.originCountry);
    return match?.label ?? draft.originCountry;
  };

  const runtimeSummary = () => {
    const key = resolveCatalogRuntimePresetKey(draft);
    if (key === 'any') {
      return anyLabel;
    }

    if (key === 'custom') {
      return `${draft.minRuntimeMinutes ?? '…'}–${draft.maxRuntimeMinutes ?? '…'}`;
    }

    return t(`discovery.advancedDiscover.runtimePresets.${key}`);
  };

  const voteCountSummary = () =>
    draft.minVoteCount != null
      ? t('discovery.catalogFilters.voteCountOption', { count: draft.minVoteCount })
      : anyLabel;

  const keywordsSummary = () => {
    if (draft.keywordIds.length === 0) {
      return anyLabel;
    }

    const names = draft.keywordIds.map(
      (id) => draft.keywordLabels[id] ?? t('discovery.catalogFilters.keywordFallback'),
    );
    return formatList(names, anyLabel);
  };

  const tvStatusSummary = () => {
    if (draft.tvStatuses.length === 0) {
      return anyLabel;
    }

    return formatList(
      draft.tvStatuses.map((status) => t(`discovery.catalogFilters.tvStatusOptions.${status}`)),
      anyLabel,
    );
  };

  const genreSummary = () =>
    formatList(
      draft.genreIds.map((id) => genreNamesById[id] ?? t('discovery.activeFilterChips.genreFallback')),
      anyLabel,
    );

  const visibleAdvancedFields = config.advancedFields.filter((field) => {
    if (field === 'tvStatus') {
      return shouldShowTvStatus(draft.contentType);
    }

    return true;
  });

  const advancedActive = hasAdvancedCatalogFiltersActive(draft, visibleAdvancedFields, {
    defaultOriginCountry: config.defaultOriginCountry ?? null,
  });

  const renderField = (field: CatalogFilterField) => {
    switch (field) {
      case 'contentType':
        return (
          <View key={field} style={styles.section}>
            <AppText variant="bodySmall" muted style={styles.sectionLabel}>
              {t('discovery.catalogFilters.contentType')}
            </AppText>
            <CatalogChipRow
              options={config.contentTypeOptions.map((value) => ({
                value,
                label: contentTypeLabel(value),
              }))}
              value={draft.contentType}
              onChange={(contentType) => updateDraft({ contentType })}
              accessibilityLabelFor={(label) => t('common.contentTypeLabel', { label })}
            />
          </View>
        );
      case 'genre':
        return (
          <FilterSelectorRow
            key={field}
            label={t('common.genre')}
            valueLabel={genreSummary()}
            onPress={() => setSelector('genre')}
          />
        );
      case 'year':
        return (
          <FilterSelectorRow
            key={field}
            label={t('common.year')}
            valueLabel={yearSummary()}
            onPress={() => setSelector('year')}
          />
        );
      case 'minRating':
        return (
          <FilterSelectorRow
            key={field}
            label={t('common.minimumRating')}
            valueLabel={ratingSummary()}
            onPress={() => setSelector('rating')}
          />
        );
      case 'originalLanguage':
        return (
          <FilterSelectorRow
            key={field}
            label={t('common.originalLanguage')}
            valueLabel={languageSummary()}
            onPress={() => setSelector('language')}
          />
        );
      case 'originCountry':
        return (
          <FilterSelectorRow
            key={field}
            label={t('common.originCountry')}
            valueLabel={countrySummary()}
            onPress={() => setSelector('country')}
          />
        );
      case 'runtime':
        return (
          <FilterSelectorRow
            key={field}
            label={t('discovery.catalogFilters.runtime')}
            valueLabel={runtimeSummary()}
            onPress={() => setSelector('runtime')}
          />
        );
      case 'minVoteCount':
        return (
          <FilterSelectorRow
            key={field}
            label={t('discovery.catalogFilters.minVoteCount')}
            valueLabel={voteCountSummary()}
            onPress={() => setSelector('voteCount')}
          />
        );
      case 'keywords':
        return (
          <FilterSelectorRow
            key={field}
            label={t('discovery.catalogFilters.keywords')}
            valueLabel={keywordsSummary()}
            onPress={() => setSelector('keywords')}
          />
        );
      case 'tvStatus':
        if (!shouldShowTvStatus(draft.contentType)) {
          return null;
        }

        return (
          <FilterSelectorRow
            key={field}
            label={t('discovery.catalogFilters.tvStatus')}
            valueLabel={tvStatusSummary()}
            onPress={() => setSelector('tvStatus')}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <CatalogFilterSheetShell
        visible={visible}
        title={t('discovery.catalogFilters.title')}
        closeLabel={t('common.close')}
        resetLabel={t('discovery.catalogFilters.reset')}
        applyLabel={t('discovery.catalogFilters.showResults')}
        onClose={onClose}
        onReset={onReset}
        onApply={() => {
          onApply(clearTvStatusesIfNeeded(draft));
          onClose();
        }}
        testID={testID}
      >
        {config.primaryFields.map(renderField)}

        {visibleAdvancedFields.length > 0 ? (
          <ExpandableAdvancedFilters
            title={t('discovery.catalogFilters.advancedFilters')}
            expanded={advancedExpanded}
            hasActiveFilters={advancedActive}
            onToggle={() => setAdvancedExpanded((current) => !current)}
          >
            {visibleAdvancedFields.map(renderField)}
          </ExpandableAdvancedFilters>
        ) : null}
      </CatalogFilterSheetShell>

      <CatalogOptionSelector
        visible={selector === 'genre'}
        title={t('common.genre')}
        closeLabel={t('common.close')}
        multi
        values={draft.genreIds}
        options={genres.map((genre) => ({
          value: genre.id,
          label: translateGenreName(genre.name),
        }))}
        onChange={(genreIds) => updateDraft({ genreIds })}
        onClose={() => setSelector(null)}
        testID="catalog-genre-selector"
      />

      <CatalogOptionSelector
        visible={selector === 'language'}
        title={t('common.originalLanguage')}
        closeLabel={t('common.close')}
        values={draft.originalLanguage ? [draft.originalLanguage] : []}
        options={[
          { value: '', label: anyLabel },
          ...CATALOG_LANGUAGE_OPTIONS.map((option) => ({
            value: option.code,
            label: t(`discovery.catalogFilters.languageNames.${option.labelKey}`),
          })),
        ]}
        onChange={(values) =>
          updateDraft({
            originalLanguage: values[0] && values[0].length > 0 ? values[0] : null,
          })
        }
        onClose={() => setSelector(null)}
      />

      <CatalogOptionSelector
        visible={selector === 'country'}
        title={t('common.originCountry')}
        closeLabel={t('common.close')}
        values={draft.originCountry ? [draft.originCountry] : []}
        options={[
          ...(config.defaultOriginCountry
            ? []
            : [{ value: '', label: anyLabel }]),
          ...countryOptions.map((option) => ({
            value: option.code,
            label: option.label,
          })),
        ]}
        onChange={(values) => {
          const next = values[0] && values[0].length > 0 ? values[0] : null;
          updateDraft({
            originCountry: next ?? config.defaultOriginCountry ?? null,
          });
        }}
        onClose={() => setSelector(null)}
      />

      <CatalogOptionSelector
        visible={selector === 'tvStatus'}
        title={t('discovery.catalogFilters.tvStatus')}
        closeLabel={t('common.close')}
        multi
        values={draft.tvStatuses}
        options={TV_DISCOVER_STATUS_OPTIONS.map((status) => ({
          value: status,
          label: t(`discovery.catalogFilters.tvStatusOptions.${status}`),
        }))}
        onChange={(tvStatuses) => updateDraft({ tvStatuses: tvStatuses as TvDiscoverStatus[] })}
        onClose={() => setSelector(null)}
      />

      {selector === 'keywords' ? (
        <CatalogKeywordSelector
          visible
          selectedIds={draft.keywordIds}
          selectedLabels={draft.keywordLabels}
          onChange={({ ids, labels }) => updateDraft({ keywordIds: ids, keywordLabels: labels })}
          onClose={() => setSelector(null)}
        />
      ) : null}

      {selector === 'rating' ? (
        <CatalogOptionSelector
          visible
          title={t('common.minimumRating')}
          closeLabel={t('common.close')}
          values={[String(draft.minRating ?? '')]}
          options={CATALOG_MIN_RATING_OPTIONS.map((rating) => ({
            value: rating == null ? '' : String(rating),
            label:
              rating == null
                ? anyLabel
                : t('discovery.catalogFilters.ratingOption', { rating }),
          }))}
          onChange={(values) => {
            const raw = values[0];
            updateDraft({
              minRating: raw && raw.length > 0 ? Number.parseFloat(raw) : null,
            });
          }}
          onClose={() => setSelector(null)}
        />
      ) : null}

      {selector === 'voteCount' ? (
        <CatalogOptionSelector
          visible
          title={t('discovery.catalogFilters.minVoteCount')}
          closeLabel={t('common.close')}
          values={[String(draft.minVoteCount ?? '')]}
          options={CATALOG_VOTE_COUNT_OPTIONS.map((count) => ({
            value: count == null ? '' : String(count),
            label:
              count == null
                ? anyLabel
                : t('discovery.catalogFilters.voteCountOption', { count }),
          }))}
          onChange={(values) => {
            const raw = values[0];
            updateDraft({
              minVoteCount: raw && raw.length > 0 ? Number.parseInt(raw, 10) : null,
            });
          }}
          onClose={() => setSelector(null)}
        />
      ) : null}

      {selector === 'year' ? (
        <CatalogFilterSheetShell
          visible
          title={t('common.year')}
          closeLabel={t('common.close')}
          resetLabel={t('discovery.catalogFilters.any')}
          applyLabel={t('discovery.catalogFilters.done')}
          onClose={() => setSelector(null)}
          onReset={() => {
            setYearMode('any');
            updateDraft({ year: null, yearFrom: null, yearTo: null });
            setSelector(null);
          }}
          onApply={() => setSelector(null)}
        >
          <CatalogChipRow
            options={[
              ...CATALOG_YEAR_PRESETS.map((preset) => ({
                value: preset.key,
                label:
                  preset.key === 'any'
                    ? anyLabel
                    : t(`discovery.catalogFilters.yearPresets.${preset.key}`),
              })),
              {
                value: 'custom' as CatalogYearPresetKey,
                label: t('discovery.catalogFilters.customRange'),
              },
            ]}
            value={yearMode}
            onChange={(key) => {
              setYearMode(key);
              if (key === 'custom') {
                updateDraft({ year: null });
                return;
              }

              const preset = CATALOG_YEAR_PRESETS.find((item) => item.key === key);
              if (!preset) {
                return;
              }

              updateDraft({
                year: preset.year,
                yearFrom: preset.yearFrom,
                yearTo: preset.yearTo,
              });
            }}
          />
          {yearMode === 'custom' ? (
            <View style={styles.rangeInputs}>
              <AppInput
                label={t('common.from')}
                value={draft.yearFrom != null ? String(draft.yearFrom) : ''}
                onChangeText={(text) => {
                  const trimmed = text.trim();
                  updateDraft({
                    year: null,
                    yearFrom: trimmed.length === 0 ? null : Number.parseInt(trimmed, 10) || null,
                  });
                }}
                placeholder={t('common.placeholderYearFromExample')}
                keyboardType="number-pad"
                maxLength={4}
              />
              <AppInput
                label={t('common.to')}
                value={draft.yearTo != null ? String(draft.yearTo) : ''}
                onChangeText={(text) => {
                  const trimmed = text.trim();
                  updateDraft({
                    year: null,
                    yearTo: trimmed.length === 0 ? null : Number.parseInt(trimmed, 10) || null,
                  });
                }}
                placeholder={t('common.placeholderYearToExample')}
                keyboardType="number-pad"
                maxLength={4}
              />
            </View>
          ) : null}
        </CatalogFilterSheetShell>
      ) : null}

      {selector === 'runtime' ? (
        <CatalogFilterSheetShell
          visible
          title={t('discovery.catalogFilters.runtime')}
          closeLabel={t('common.close')}
          resetLabel={t('discovery.catalogFilters.any')}
          applyLabel={t('discovery.catalogFilters.done')}
          onClose={() => setSelector(null)}
          onReset={() => {
            setRuntimeMode('any');
            updateDraft({ minRuntimeMinutes: null, maxRuntimeMinutes: null });
            setSelector(null);
          }}
          onApply={() => setSelector(null)}
        >
          <CatalogChipRow
            options={CATALOG_RUNTIME_PRESETS.map((preset) => ({
              value: preset.key,
              label:
                preset.key === 'any'
                  ? anyLabel
                  : t(`discovery.advancedDiscover.runtimePresets.${preset.key}`),
            }))}
            value={runtimeMode === 'custom' ? 'any' : runtimeMode}
            onChange={(key) => {
              setRuntimeMode(key);
              const preset = CATALOG_RUNTIME_PRESETS.find((item) => item.key === key);
              if (!preset) {
                return;
              }

              updateDraft({
                minRuntimeMinutes: preset.minRuntimeMinutes,
                maxRuntimeMinutes: preset.maxRuntimeMinutes,
              });
            }}
          />
        </CatalogFilterSheetShell>
      ) : null}

      {genresQuery.isLoading && selector === 'genre' ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sectionLabel: {
    fontWeight: '600',
  },
  rangeInputs: {
    gap: spacing.sm,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
