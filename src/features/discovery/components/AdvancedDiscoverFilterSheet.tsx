import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  translateAdvancedDiscoverMediaType,
  translateAdvancedDiscoverRuntimePreset,
  translateAdvancedDiscoverSort,
} from '@/i18n/catalog-labels';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { translateGenreName } from '@/i18n/catalog-labels';
import { AppInput } from '@/components/inputs/AppInput';
import { useDiscoveryWatchProviders } from '../hooks/useDiscoveryWatchProviders';
import { useGenres } from '../hooks/useGenres';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { RegionSelector } from '@/features/regions/components/RegionSelector';
import { WatchMonetizationSelector } from './WatchMonetizationSelector';
import { WatchProviderSelector } from './WatchProviderSelector';
import { WatchRegionSelector } from './WatchRegionSelector';
import {
  listCertificationOptions,
  isSupportedCertificationCountry,
} from '../discover-certification-options';
import { DISCOVER_RELEASE_TYPE_OPTIONS } from '../discover-release-type-options';
import { translateDiscoverReleaseType } from '@/i18n/catalog-labels';
import {
  ADVANCED_DISCOVER_MEDIA_OPTIONS,
  ADVANCED_DISCOVER_RUNTIME_PRESETS,
  ADVANCED_DISCOVER_SORT_OPTIONS,
  ADVANCED_DISCOVER_VOTE_COUNT_OPTIONS,
  createDefaultAdvancedDiscoverFilters,
  ensureStreamingDraftDefaults,
  type AdvancedDiscoverFilters,
  type AdvancedDiscoverMediaType,
  type AdvancedDiscoverSort,
  type GenreMatchMode,
} from '../advanced-discover-types';
import type { Genre } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface AdvancedDiscoverFilterSheetProps {
  visible: boolean;
  mediaType: AdvancedDiscoverMediaType;
  filters: AdvancedDiscoverFilters;
  onClose: () => void;
  onApply: (mediaType: AdvancedDiscoverMediaType, filters: AdvancedDiscoverFilters) => void;
  onClear: () => void;
}

function toggleGenre(genreIds: string[], genreId: string): string[] {
  return genreIds.includes(genreId)
    ? genreIds.filter((id) => id !== genreId)
    : [...genreIds, genreId];
}

function GenreSelector({
  genres,
  selectedIds,
  onToggle,
  noGenresLabel,
  genreAccessibilityLabel,
}: {
  genres: Genre[];
  selectedIds: string[];
  onToggle: (genreId: string) => void;
  noGenresLabel: string;
  genreAccessibilityLabel: (name: string) => string;
}) {
  if (genres.length === 0) {
    return (
      <AppText variant="bodySmall" muted>
        {noGenresLabel}
      </AppText>
    );
  }

  return (
    <View style={styles.chipGrid}>
      {genres.map((genre) => {
        const selected = selectedIds.includes(genre.id);

        return (
          <Pressable
            key={genre.id}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={genreAccessibilityLabel(translateGenreName(genre.name))}
            onPress={() => onToggle(genre.id)}
            style={[styles.filterChip, selected && styles.filterChipSelected]}
          >
            <AppText
              variant="caption"
              style={[styles.filterChipLabel, selected && styles.filterChipLabelSelected]}
            >
              {translateGenreName(genre.name)}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function MediaTypeSelector({
  value,
  onChange,
  mediaTypeAccessibilityLabel,
}: {
  value: AdvancedDiscoverMediaType;
  onChange: (value: AdvancedDiscoverMediaType) => void;
  mediaTypeAccessibilityLabel: (label: string) => string;
}) {
  return (
    <View style={styles.chipGrid}>
      {ADVANCED_DISCOVER_MEDIA_OPTIONS.map((mediaOption) => {
        const selected = mediaOption === value;
        const label = translateAdvancedDiscoverMediaType(mediaOption);

        return (
          <Pressable
            key={mediaOption}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={mediaTypeAccessibilityLabel(label)}
            onPress={() => onChange(mediaOption)}
            style={[styles.filterChip, selected && styles.filterChipSelected]}
          >
            <AppText
              variant="caption"
              style={[styles.filterChipLabel, selected && styles.filterChipLabelSelected]}
            >
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function SortSelector({
  value,
  onChange,
  sortAccessibilityLabel,
}: {
  value: AdvancedDiscoverSort;
  onChange: (value: AdvancedDiscoverSort) => void;
  sortAccessibilityLabel: (label: string) => string;
}) {
  return (
    <View style={styles.chipGrid}>
      {ADVANCED_DISCOVER_SORT_OPTIONS.map((sortOption) => {
        const selected = sortOption === value;
        const label = translateAdvancedDiscoverSort(sortOption);

        return (
          <Pressable
            key={sortOption}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={sortAccessibilityLabel(label)}
            onPress={() => onChange(sortOption)}
            style={[styles.filterChip, selected && styles.filterChipSelected]}
          >
            <AppText
              variant="caption"
              style={[styles.filterChipLabel, selected && styles.filterChipLabelSelected]}
            >
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

function RuntimeSelector({
  minRuntimeMinutes,
  maxRuntimeMinutes,
  onChange,
  runtimeAccessibilityLabel,
}: {
  minRuntimeMinutes: number | null;
  maxRuntimeMinutes: number | null;
  onChange: (min: number | null, max: number | null) => void;
  runtimeAccessibilityLabel: (label: string) => string;
}) {
  return (
    <View style={styles.chipGrid}>
      {ADVANCED_DISCOVER_RUNTIME_PRESETS.map((preset) => {
        const selected =
          preset.minRuntimeMinutes === minRuntimeMinutes &&
          preset.maxRuntimeMinutes === maxRuntimeMinutes;
        const label = translateAdvancedDiscoverRuntimePreset(preset.key);

        return (
          <Pressable
            key={preset.key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={runtimeAccessibilityLabel(label)}
            onPress={() => onChange(preset.minRuntimeMinutes, preset.maxRuntimeMinutes)}
            style={[styles.filterChip, selected && styles.filterChipSelected]}
          >
            <AppText
              variant="caption"
              style={[styles.filterChipLabel, selected && styles.filterChipLabelSelected]}
            >
              {label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
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
  const wasVisibleRef = useRef(false);
  const [draftMediaType, setDraftMediaType] = useState<AdvancedDiscoverMediaType>(mediaType);
  const [draft, setDraft] = useState<AdvancedDiscoverFilters>(filters);
  const [useYearRange, setUseYearRange] = useState(
    filters.yearFrom != null || filters.yearTo != null,
  );
  const { region: userRegion, isHydrated } = useRegionalPreference();
  const [watchRegionExpanded, setWatchRegionExpanded] = useState(false);
  const [certificationCountryExpanded, setCertificationCountryExpanded] = useState(false);
  const watchRegion = draft.watchRegion ?? userRegion;
  const certificationCountry = draft.certificationCountry ?? userRegion;
  const certificationOptions = listCertificationOptions(certificationCountry);
  const providersQuery = useDiscoveryWatchProviders(draftMediaType, watchRegion, isHydrated);

  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      setDraftMediaType(mediaType);
      setDraft(filters);
      setUseYearRange(filters.yearFrom != null || filters.yearTo != null);
    }

    wasVisibleRef.current = visible;
  }, [visible, filters, mediaType]);

  const handleApply = () => {
    onApply(draftMediaType, ensureStreamingDraftDefaults(draft, userRegion));
    onClose();
  };

  const handleClear = () => {
    setDraftMediaType('movie');
    setDraft(createDefaultAdvancedDiscoverFilters());
    setUseYearRange(false);
    onClear();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.sheetInner}>
            <View style={styles.header}>
              <AppText variant="subtitle">{t('discovery.advancedDiscover.sheetTitle')}</AppText>
              <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
            <AppText variant="bodySmall" style={styles.sectionHeading}>
              {t('discovery.advancedDiscover.sections.content')}
            </AppText>
            <View style={styles.section}>
              <AppText variant="bodySmall" style={styles.sectionLabel}>{t('discovery.advancedDiscover.mediaTypeSection')}</AppText>
              <MediaTypeSelector
                value={draftMediaType}
                mediaTypeAccessibilityLabel={(label) => t('common.mediaTypeLabel', { label })}
                onChange={(nextType) => {
                  setDraftMediaType(nextType);
                  setDraft((current) => ({
                    ...current,
                    genreIds: [],
                    watchProviderIds: [],
                    certification: null,
                    certificationCountry: null,
                    releaseTypes: [],
                  }));
                }}
              />
            </View>

            <View style={styles.section}>
              <AppText variant="bodySmall" style={styles.sectionLabel}>{t('discovery.filterSheet.genresSection')}</AppText>
              {genresQuery.isLoading ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <GenreSelector
                  genres={genresQuery.data ?? []}
                  selectedIds={draft.genreIds}
                  noGenresLabel={t('common.noGenresAvailable')}
                  genreAccessibilityLabel={(name) => t('common.genreLabel', { name })}
                  onToggle={(genreId) =>
                    setDraft((current) => ({
                      ...current,
                      genreIds: toggleGenre(current.genreIds, genreId),
                    }))
                  }
                />
              )}
              {draft.genreIds.length > 1 ? (
                <View style={styles.chipGrid}>
                  {(['all', 'any'] as GenreMatchMode[]).map((mode) => {
                    const selected = draft.genreMatch === mode;
                    const label = t(`discovery.advancedDiscover.genreMatch.${mode}`);

                    return (
                      <Pressable
                        key={mode}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        accessibilityLabel={label}
                        onPress={() => setDraft((current) => ({ ...current, genreMatch: mode }))}
                        style={[styles.filterChip, selected && styles.filterChipSelected]}
                      >
                        <AppText
                          variant="caption"
                          style={[styles.filterChipLabel, selected && styles.filterChipLabelSelected]}
                        >
                          {label}
                        </AppText>
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}
            </View>

            <AppText variant="bodySmall" style={styles.sectionHeading}>
              {t('discovery.advancedDiscover.sections.release')}
            </AppText>
            <View style={styles.section}>
              <AppText variant="bodySmall" style={styles.sectionLabel}>{t('discovery.advancedDiscover.yearSection')}</AppText>
              <View style={styles.chipGrid}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: !useYearRange }}
                  accessibilityLabel={t('common.singleYear')}
                  onPress={() => {
                    setUseYearRange(false);
                    setDraft((current) => ({ ...current, yearFrom: null, yearTo: null }));
                  }}
                  style={[styles.filterChip, !useYearRange && styles.filterChipSelected]}
                >
                  <AppText variant="caption">{t('common.singleYear')}</AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: useYearRange }}
                  accessibilityLabel={t('common.yearRange')}
                  onPress={() => {
                    setUseYearRange(true);
                    setDraft((current) => ({ ...current, year: null }));
                  }}
                  style={[styles.filterChip, useYearRange && styles.filterChipSelected]}
                >
                  <AppText variant="caption">{t('common.yearRange')}</AppText>
                </Pressable>
              </View>
            </View>

            {useYearRange ? (
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <AppInput
                    label={t('common.from')}
                    value={draft.yearFrom != null ? String(draft.yearFrom) : ''}
                    onChangeText={(text) => {
                      const trimmed = text.trim();
                      setDraft((current) => ({
                        ...current,
                        yearFrom:
                          trimmed.length === 0 ? null : Number.parseInt(trimmed, 10) || null,
                      }));
                    }}
                    placeholder={t('common.placeholderYearFromExample')}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
                <View style={styles.halfInput}>
                  <AppInput
                    label={t('common.to')}
                    value={draft.yearTo != null ? String(draft.yearTo) : ''}
                    onChangeText={(text) => {
                      const trimmed = text.trim();
                      setDraft((current) => ({
                        ...current,
                        yearTo: trimmed.length === 0 ? null : Number.parseInt(trimmed, 10) || null,
                      }));
                    }}
                    placeholder={t('common.placeholderYearToExample')}
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              </View>
            ) : (
              <AppInput
                label={t('common.year')}
                value={draft.year != null ? String(draft.year) : ''}
                onChangeText={(text) => {
                  const trimmed = text.trim();
                  setDraft((current) => ({
                    ...current,
                    year: trimmed.length === 0 ? null : Number.parseInt(trimmed, 10) || null,
                  }));
                }}
                placeholder={t('common.placeholderYearExample')}
                keyboardType="number-pad"
                maxLength={4}
              />
            )}

            {draftMediaType === 'movie' ? (
              <>
                <View style={styles.section}>
                  <AppText variant="bodySmall" style={styles.sectionLabel}>
                    {t('discovery.advancedDiscover.certificationSection')}
                  </AppText>
                  <RegionSelector
                    label={t('discovery.advancedDiscover.certificationCountry')}
                    value={certificationCountry}
                    expanded={certificationCountryExpanded}
                    onToggleExpanded={() => setCertificationCountryExpanded((value) => !value)}
                    onSelect={(code) =>
                      setDraft((current) => ({
                        ...current,
                        certificationCountry: code,
                        certification: null,
                      }))
                    }
                  />
                  {isSupportedCertificationCountry(certificationCountry) ? (
                    <View style={styles.chipGrid}>
                      {certificationOptions.map((option) => {
                        const selected = draft.certification === option.value;

                        return (
                          <Pressable
                            key={option.value}
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                            onPress={() =>
                              setDraft((current) => ({
                                ...current,
                                certificationCountry,
                                certification: selected ? null : option.value,
                              }))
                            }
                            style={[styles.filterChip, selected && styles.filterChipSelected]}
                          >
                            <AppText
                              variant="caption"
                              style={[styles.filterChipLabel, selected && styles.filterChipLabelSelected]}
                            >
                              {option.label}
                            </AppText>
                          </Pressable>
                        );
                      })}
                    </View>
                  ) : (
                    <AppText variant="bodySmall" muted>
                      {t('discovery.advancedDiscover.certificationUnavailable')}
                    </AppText>
                  )}
                </View>
                <View style={styles.section}>
                  <AppText variant="bodySmall" style={styles.sectionLabel}>
                    {t('discovery.advancedDiscover.releaseTypeSection')}
                  </AppText>
                  <View style={styles.chipGrid}>
                    {DISCOVER_RELEASE_TYPE_OPTIONS.map((option) => {
                      const selected = draft.releaseTypes.includes(option.value);

                      return (
                        <Pressable
                          key={option.value}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          onPress={() =>
                            setDraft((current) => ({
                              ...current,
                              releaseTypes: selected
                                ? current.releaseTypes.filter((entry) => entry !== option.value)
                                : [...current.releaseTypes, option.value],
                            }))
                          }
                          style={[styles.filterChip, selected && styles.filterChipSelected]}
                        >
                          <AppText
                            variant="caption"
                            style={[styles.filterChipLabel, selected && styles.filterChipLabelSelected]}
                          >
                            {translateDiscoverReleaseType(option.value)}
                          </AppText>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </>
            ) : null}

            <AppText variant="bodySmall" style={styles.sectionHeading}>
              {t('discovery.advancedDiscover.sections.quality')}
            </AppText>
            <AppInput
              label={t('common.minimumRating')}
              value={draft.minRating != null ? String(draft.minRating) : ''}
              onChangeText={(text) => {
                const trimmed = text.trim();
                setDraft((current) => ({
                  ...current,
                  minRating: trimmed.length === 0 ? null : Number.parseFloat(trimmed) || null,
                }));
              }}
              placeholder={t('common.placeholderRatingRange')}
              keyboardType="decimal-pad"
              maxLength={4}
            />
            <AppInput
              label={t('common.maximumRating')}
              value={draft.maxRating != null ? String(draft.maxRating) : ''}
              onChangeText={(text) => {
                const trimmed = text.trim();
                setDraft((current) => ({
                  ...current,
                  maxRating: trimmed.length === 0 ? null : Number.parseFloat(trimmed) || null,
                }));
              }}
              placeholder={t('common.placeholderRatingRange')}
              keyboardType="decimal-pad"
              maxLength={4}
            />
            <View style={styles.section}>
              <AppText variant="bodySmall" style={styles.sectionLabel}>
                {t('discovery.advancedDiscover.voteCount.section')}
              </AppText>
              <View style={styles.chipGrid}>
                {ADVANCED_DISCOVER_VOTE_COUNT_OPTIONS.map((option) => {
                  const selected = draft.minVoteCount === option;
                  const label =
                    option == null
                      ? t('discovery.advancedDiscover.voteCount.any')
                      : t('discovery.advancedDiscover.voteCount.option', { count: option });

                  return (
                    <Pressable
                      key={String(option)}
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      onPress={() =>
                        setDraft((current) => ({
                          ...current,
                          minVoteCount: option,
                        }))
                      }
                      style={[styles.filterChip, selected && styles.filterChipSelected]}
                    >
                      <AppText
                        variant="caption"
                        style={[styles.filterChipLabel, selected && styles.filterChipLabelSelected]}
                      >
                        {label}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <AppText variant="bodySmall" style={styles.sectionHeading}>
              {t('discovery.advancedDiscover.sections.duration')}
            </AppText>
            <View style={styles.section}>
              <AppText variant="bodySmall" style={styles.sectionLabel}>{t('discovery.advancedDiscover.runtimeSection')}</AppText>
              <RuntimeSelector
                minRuntimeMinutes={draft.minRuntimeMinutes}
                maxRuntimeMinutes={draft.maxRuntimeMinutes}
                runtimeAccessibilityLabel={(label) => t('common.runtimeLabel', { label })}
                onChange={(min, max) =>
                  setDraft((current) => ({
                    ...current,
                    minRuntimeMinutes: min,
                    maxRuntimeMinutes: max,
                  }))
                }
              />
            </View>

            <AppText variant="bodySmall" style={styles.sectionHeading}>
              {t('discovery.advancedDiscover.sections.origin')}
            </AppText>
            <AppInput
              label={t('common.originalLanguage')}
              value={draft.originalLanguage ?? ''}
              onChangeText={(text) =>
                setDraft((current) => ({
                  ...current,
                  originalLanguage: text.trim().length > 0 ? text.trim().toLowerCase() : null,
                }))
              }
              placeholder={t('common.placeholderLanguageExample')}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={8}
            />

            <AppInput
              label={t('common.originCountry')}
              value={draft.originCountry ?? ''}
              onChangeText={(text) =>
                setDraft((current) => ({
                  ...current,
                  originCountry:
                    text.trim().length === 2 ? text.trim().toUpperCase() : text.trim() || null,
                }))
              }
              placeholder={t('common.placeholderCountryExample')}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={2}
            />

            <AppText variant="bodySmall" style={styles.sectionHeading}>
              {t('discovery.advancedDiscover.sections.streaming')}
            </AppText>
            <View style={styles.section}>
              <WatchRegionSelector
                value={watchRegion}
                expanded={watchRegionExpanded}
                onToggleExpanded={() => setWatchRegionExpanded((value) => !value)}
                onSelect={(code) => setDraft((current) => ({ ...current, watchRegion: code }))}
              />
              <WatchProviderSelector
                providers={providersQuery.data?.providers ?? []}
                selectedProviderIds={draft.watchProviderIds}
                isLoading={providersQuery.isLoading}
                isError={providersQuery.isError}
                onRetry={() => void providersQuery.refetch()}
                onToggle={(providerId) =>
                  setDraft((current) => {
                    const removing = current.watchProviderIds.includes(providerId);
                    const watchProviderIds = removing
                      ? current.watchProviderIds.filter((id) => id !== providerId)
                      : [...current.watchProviderIds, providerId];
                    const watchMonetizationTypes =
                      !removing &&
                      watchProviderIds.length > 0 &&
                      current.watchMonetizationTypes.length === 0
                        ? (['stream'] as const)
                        : current.watchMonetizationTypes;

                    return {
                      ...current,
                      watchProviderIds,
                      watchMonetizationTypes: [...watchMonetizationTypes],
                    };
                  })
                }
              />
              <WatchMonetizationSelector
                selectedTypes={draft.watchMonetizationTypes}
                onToggle={(type) =>
                  setDraft((current) => ({
                    ...current,
                    watchMonetizationTypes: current.watchMonetizationTypes.includes(type)
                      ? current.watchMonetizationTypes.filter((entry) => entry !== type)
                      : [...current.watchMonetizationTypes, type],
                  }))
                }
              />
            </View>

            <AppText variant="bodySmall" style={styles.sectionHeading}>
              {t('discovery.advancedDiscover.sections.sort')}
            </AppText>
            <View style={styles.section}>
              <AppText variant="bodySmall" style={styles.sectionLabel}>{t('discovery.filterSheet.sortSection')}</AppText>
              <SortSelector
                value={draft.sort ?? 'popularity_desc'}
                sortAccessibilityLabel={(label) => t('common.sortByLabel', { label })}
                onChange={(sort) => setDraft((current) => ({ ...current, sort }))}
              />
            </View>
            </ScrollView>

            <View style={styles.footer}>
              <AppButton title={t('discovery.filterSheet.reset')} variant="secondary" onPress={handleClear} />
              <AppButton title={t('discovery.filterSheet.showResults')} onPress={handleApply} />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  sheet: {
    maxHeight: '88%',
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
  },
  sheetInner: {
    flexShrink: 1,
    maxHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  scroll: {
    flexGrow: 1,
    flexShrink: 1,
    paddingHorizontal: spacing.lg,
  },
  scrollContent: {
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  section: {
    gap: spacing.xs,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  sectionHeading: {
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  halfInput: {
    flex: 1,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    minHeight: 44,
    justifyContent: 'center',
  },
  filterChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentTint12,
  },
  filterChipLabel: {
    color: colors.textPrimary,
  },
  filterChipLabelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  footer: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
