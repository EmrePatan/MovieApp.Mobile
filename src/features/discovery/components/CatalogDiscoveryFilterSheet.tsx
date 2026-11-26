import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { translateGenreName } from '@/i18n/catalog-labels';
import {
  CatalogChipRow,
  CatalogFilterSheetShell,
  CatalogKeywordSelectorPanel,
  CatalogOptionList,
  FilterSelectorRow,
} from '@/features/catalog/components';
import { CatalogMyPlatformsFilter } from './CatalogMyPlatformsFilter';
import { useGenres } from '../hooks/useGenres';
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
import { TV_DISCOVER_STATUS_OPTIONS, type TvDiscoverStatus } from '../tv-discover-status';
import {
  clearTvStatusesIfNeeded,
  shouldShowTvStatus,
  type CatalogContentType,
  type CatalogFilterDraft,
  type CatalogFilterField,
  type CatalogFilterSheetConfig,
} from '../utils/catalog-filter-draft';
import { premiumSheetChrome } from '@/theme/premium-sheet';
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
  const [selector, setSelector] = useState<SelectorKind>(null);
  const [yearPanelKey, setYearPanelKey] = useState(0);

  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      setDraft(appliedDraft);
      setSelector(null);
    }

    wasVisibleRef.current = visible;
  }, [visible, appliedDraft]);

  const summaries = useFilterSummaries();
  const { anyLabel } = summaries;
  const genres = useMemo(() => genresQuery.data ?? [], [genresQuery.data]);

  const genreNamesById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const genre of genres) {
      map[genre.id] = translateGenreName(genre.name);
    }
    return map;
  }, [genres]);

  const updateDraft = (patch: Partial<CatalogFilterDraft>) => {
    setDraft((current) => {
      // Platform catalogs differ per content type, so a change starts the platform filter over.
      const contentTypeChanged =
        patch.contentType !== undefined && patch.contentType !== current.contentType;

      return clearTvStatusesIfNeeded({
        ...current,
        ...(contentTypeChanged ? { watchProviderIds: [] } : null),
        ...patch,
      });
    });
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

  const keywordsSummary = () => {
    if (draft.keywordIds.length === 0) {
      return anyLabel;
    }

    const names = draft.keywordIds.map(
      (id) => draft.keywordLabels[id] ?? t('discovery.catalogFilters.keywordFallback'),
    );
    return formatFilterList(names, anyLabel);
  };

  const tvStatusSummary = () => {
    if (draft.tvStatuses.length === 0) {
      return anyLabel;
    }

    return formatFilterList(
      draft.tvStatuses.map((status) => t(`discovery.catalogFilters.tvStatusOptions.${status}`)),
      anyLabel,
    );
  };

  const genreSummary = () =>
    formatFilterList(
      draft.genreIds.map((id) => genreNamesById[id] ?? t('discovery.activeFilterChips.genreFallback')),
      anyLabel,
    );

  const visibleFields = config.fields.filter((field) => {
    if (field === 'tvStatus') {
      return shouldShowTvStatus(draft.contentType);
    }

    return true;
  });

  const selectorTitle = (() => {
    switch (selector) {
      case 'genre':
        return t('common.genre');
      case 'year':
        return t('common.year');
      case 'rating':
        return t('common.minimumRating');
      case 'language':
        return t('common.originalLanguage');
      case 'country':
        return t('common.originCountry');
      case 'runtime':
        return t('discovery.catalogFilters.runtime');
      case 'voteCount':
        return t('discovery.catalogFilters.minVoteCount');
      case 'keywords':
        return t('discovery.catalogFilters.keywords');
      case 'tvStatus':
        return t('discovery.catalogFilters.tvStatus');
      default:
        return t('discovery.catalogFilters.title');
    }
  })();

  const renderSelectorContent = () => {
    switch (selector) {
      case 'genre':
        return (
          <GenreFilterList
            genres={genres}
            isLoading={genresQuery.isLoading}
            selectedIds={draft.genreIds}
            onChange={(genreIds) => updateDraft({ genreIds })}
          />
        );
      case 'rating':
        return (
          <RatingFilterList
            value={draft.minRating}
            onChange={(minRating) => updateDraft({ minRating })}
            onComplete={() => setSelector(null)}
          />
        );
      case 'language':
        return (
          <LanguageFilterList
            value={draft.originalLanguage}
            onChange={(originalLanguage) => updateDraft({ originalLanguage })}
            onComplete={() => setSelector(null)}
          />
        );
      case 'country':
        return (
          <CountryFilterList
            value={draft.originCountry}
            defaultCountry={config.defaultOriginCountry}
            onChange={(originCountry) => updateDraft({ originCountry })}
            onComplete={() => setSelector(null)}
          />
        );
      case 'tvStatus':
        return (
          <CatalogOptionList
            multi
            values={draft.tvStatuses}
            options={TV_DISCOVER_STATUS_OPTIONS.map((status) => ({
              value: status,
              label: t(`discovery.catalogFilters.tvStatusOptions.${status}`),
            }))}
            onChange={(tvStatuses) => updateDraft({ tvStatuses: tvStatuses as TvDiscoverStatus[] })}
          />
        );
      case 'voteCount':
        return (
          <VoteCountFilterList
            value={draft.minVoteCount}
            onChange={(minVoteCount) => updateDraft({ minVoteCount })}
            onComplete={() => setSelector(null)}
          />
        );
      case 'keywords':
        return (
          <CatalogKeywordSelectorPanel
            active
            selectedIds={draft.keywordIds}
            selectedLabels={draft.keywordLabels}
            onChange={({ ids, labels }) => updateDraft({ keywordIds: ids, keywordLabels: labels })}
            testID="catalog-keyword-selector"
          />
        );
      case 'year':
        return <YearFilterPanel key={yearPanelKey} value={draft} onChange={updateDraft} />;
      case 'runtime':
        return <RuntimeFilterPanel value={draft} onChange={updateDraft} />;
      default:
        return null;
    }
  };

  const renderField = (field: CatalogFilterField) => {
    switch (field) {
      case 'contentType':
        return (
          <View key={field} style={styles.section}>
            <AppText variant="bodySmall" style={premiumSheetChrome.sectionLabel}>
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
            valueLabel={summaries.year(draft)}
            onPress={() => setSelector('year')}
          />
        );
      case 'minRating':
        return (
          <FilterSelectorRow
            key={field}
            label={t('common.minimumRating')}
            valueLabel={summaries.rating(draft.minRating)}
            onPress={() => setSelector('rating')}
          />
        );
      case 'originalLanguage':
        return (
          <FilterSelectorRow
            key={field}
            label={t('common.originalLanguage')}
            valueLabel={summaries.language(draft.originalLanguage)}
            onPress={() => setSelector('language')}
          />
        );
      case 'originCountry':
        return (
          <FilterSelectorRow
            key={field}
            label={t('common.originCountry')}
            valueLabel={summaries.country(draft.originCountry)}
            valueFlagEmoji={flagEmojiForOriginCountry(draft.originCountry)}
            onPress={() => setSelector('country')}
          />
        );
      case 'runtime':
        return (
          <FilterSelectorRow
            key={field}
            label={t('discovery.catalogFilters.runtime')}
            valueLabel={summaries.runtime(draft)}
            onPress={() => setSelector('runtime')}
          />
        );
      case 'minVoteCount':
        return (
          <FilterSelectorRow
            key={field}
            label={t('discovery.catalogFilters.minVoteCount')}
            valueLabel={summaries.voteCount(draft.minVoteCount)}
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

  const inSelector = selector != null;
  const showSelectorFooter = selector === 'year' || selector === 'runtime';
  const keywordSelectorActive = selector === 'keywords';

  const handleHeaderAction = () => {
    if (inSelector) {
      setSelector(null);
      return;
    }

    onClose();
  };

  return (
    <CatalogFilterSheetShell
      visible={visible}
      title={selectorTitle}
      headerAction={inSelector ? 'back' : 'close'}
      headerActionLabel={inSelector ? t('common.back') : t('common.close')}
      onHeaderAction={handleHeaderAction}
      resetLabel={
        showSelectorFooter ? t('discovery.catalogFilters.any') : t('discovery.catalogFilters.reset')
      }
      applyLabel={
        showSelectorFooter
          ? t('discovery.catalogFilters.done')
          : t('discovery.catalogFilters.showResults')
      }
      onReset={
        showSelectorFooter
          ? () => {
              if (selector === 'year') {
                // Remount so the panel drops its custom-range mode.
                setYearPanelKey((key) => key + 1);
                updateDraft({ year: null, yearFrom: null, yearTo: null });
              } else if (selector === 'runtime') {
                updateDraft({ minRuntimeMinutes: null, maxRuntimeMinutes: null });
              }
            }
          : onReset
      }
      onApply={
        showSelectorFooter
          ? () => setSelector(null)
          : () => {
              onApply(clearTvStatusesIfNeeded(draft));
              onClose();
            }
      }
      showFooterActions
      keywordDrillDown={keywordSelectorActive}
      testID={testID}
    >
      {inSelector ? (
        renderSelectorContent()
      ) : (
        visibleFields.map((field) =>
          field === 'genre' && config.supportsMyPlatforms ? (
            <Fragment key={field}>
              <CatalogMyPlatformsFilter
                contentType={draft.contentType}
                selectedProviderIds={draft.watchProviderIds}
                onChange={(watchProviderIds) => updateDraft({ watchProviderIds })}
                onChoose={onClose}
              />
              {renderField(field)}
            </Fragment>
          ) : (
            renderField(field)
          ),
        )
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
