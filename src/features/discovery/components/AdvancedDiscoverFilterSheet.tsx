import { useEffect, useRef, useState } from 'react';
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
import { AppInput } from '@/components/inputs/AppInput';
import { useDiscoveryWatchProviders } from '../hooks/useDiscoveryWatchProviders';
import { useGenres } from '../hooks/useGenres';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { WatchMonetizationSelector } from './WatchMonetizationSelector';
import { WatchProviderSelector } from './WatchProviderSelector';
import {
  ADVANCED_DISCOVER_MEDIA_OPTIONS,
  ADVANCED_DISCOVER_RUNTIME_PRESETS,
  ADVANCED_DISCOVER_SORT_OPTIONS,
  createDefaultAdvancedDiscoverFilters,
  type AdvancedDiscoverFilters,
  type AdvancedDiscoverMediaType,
  type AdvancedDiscoverSort,
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
}: {
  genres: Genre[];
  selectedIds: string[];
  onToggle: (genreId: string) => void;
}) {
  if (genres.length === 0) {
    return (
      <AppText variant="bodySmall" muted>
        No genres available.
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
            accessibilityLabel={`Genre ${genre.name}`}
            onPress={() => onToggle(genre.id)}
            style={[styles.filterChip, selected && styles.filterChipSelected]}
          >
            <AppText
              variant="caption"
              style={[styles.filterChipLabel, selected && styles.filterChipLabelSelected]}
            >
              {genre.name}
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
}: {
  value: AdvancedDiscoverMediaType;
  onChange: (value: AdvancedDiscoverMediaType) => void;
}) {
  return (
    <View style={styles.chipGrid}>
      {ADVANCED_DISCOVER_MEDIA_OPTIONS.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Media type ${option.label}`}
            onPress={() => onChange(option.value)}
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
  );
}

function SortSelector({
  value,
  onChange,
}: {
  value: AdvancedDiscoverSort;
  onChange: (value: AdvancedDiscoverSort) => void;
}) {
  return (
    <View style={styles.chipGrid}>
      {ADVANCED_DISCOVER_SORT_OPTIONS.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Sort ${option.label}`}
            onPress={() => onChange(option.value)}
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
  );
}

function RuntimeSelector({
  minRuntimeMinutes,
  maxRuntimeMinutes,
  onChange,
}: {
  minRuntimeMinutes: number | null;
  maxRuntimeMinutes: number | null;
  onChange: (min: number | null, max: number | null) => void;
}) {
  return (
    <View style={styles.chipGrid}>
      {ADVANCED_DISCOVER_RUNTIME_PRESETS.map((preset) => {
        const selected =
          preset.minRuntimeMinutes === minRuntimeMinutes &&
          preset.maxRuntimeMinutes === maxRuntimeMinutes;

        return (
          <Pressable
            key={preset.label}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={`Runtime ${preset.label}`}
            onPress={() => onChange(preset.minRuntimeMinutes, preset.maxRuntimeMinutes)}
            style={[styles.filterChip, selected && styles.filterChipSelected]}
          >
            <AppText
              variant="caption"
              style={[styles.filterChipLabel, selected && styles.filterChipLabelSelected]}
            >
              {preset.label}
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
  const genresQuery = useGenres();
  const wasVisibleRef = useRef(false);
  const [draftMediaType, setDraftMediaType] = useState<AdvancedDiscoverMediaType>(mediaType);
  const [draft, setDraft] = useState<AdvancedDiscoverFilters>(filters);
  const [useYearRange, setUseYearRange] = useState(
    filters.yearFrom != null || filters.yearTo != null,
  );
  const { region: userRegion, isHydrated } = useRegionalPreference();
  const watchRegion = draft.watchRegion ?? userRegion;
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
    onApply(draftMediaType, draft);
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
          <View style={styles.header}>
            <AppText variant="subtitle">Advanced Discover</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.section}>
              <AppText variant="bodySmall" style={styles.sectionLabel}>Media Type</AppText>
              <MediaTypeSelector
                value={draftMediaType}
                onChange={(nextType) => {
                  setDraftMediaType(nextType);
                  setDraft((current) => ({
                    ...current,
                    genreIds: [],
                    watchProviderIds: [],
                  }));
                }}
              />
            </View>

            <View style={styles.section}>
              <AppText variant="bodySmall" style={styles.sectionLabel}>Genres</AppText>
              {genresQuery.isLoading ? (
                <ActivityIndicator color={colors.accent} />
              ) : (
                <GenreSelector
                  genres={genresQuery.data ?? []}
                  selectedIds={draft.genreIds}
                  onToggle={(genreId) =>
                    setDraft((current) => ({
                      ...current,
                      genreIds: toggleGenre(current.genreIds, genreId),
                    }))
                  }
                />
              )}
            </View>

            <View style={styles.section}>
              <AppText variant="bodySmall" style={styles.sectionLabel}>Year</AppText>
              <View style={styles.chipGrid}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: !useYearRange }}
                  accessibilityLabel="Single year"
                  onPress={() => {
                    setUseYearRange(false);
                    setDraft((current) => ({ ...current, yearFrom: null, yearTo: null }));
                  }}
                  style={[styles.filterChip, !useYearRange && styles.filterChipSelected]}
                >
                  <AppText variant="caption">Single year</AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: useYearRange }}
                  accessibilityLabel="Year range"
                  onPress={() => {
                    setUseYearRange(true);
                    setDraft((current) => ({ ...current, year: null }));
                  }}
                  style={[styles.filterChip, useYearRange && styles.filterChipSelected]}
                >
                  <AppText variant="caption">Year range</AppText>
                </Pressable>
              </View>
            </View>

            {useYearRange ? (
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <AppInput
                    label="From"
                    value={draft.yearFrom != null ? String(draft.yearFrom) : ''}
                    onChangeText={(text) => {
                      const trimmed = text.trim();
                      setDraft((current) => ({
                        ...current,
                        yearFrom:
                          trimmed.length === 0 ? null : Number.parseInt(trimmed, 10) || null,
                      }));
                    }}
                    placeholder="e.g. 2010"
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
                <View style={styles.halfInput}>
                  <AppInput
                    label="To"
                    value={draft.yearTo != null ? String(draft.yearTo) : ''}
                    onChangeText={(text) => {
                      const trimmed = text.trim();
                      setDraft((current) => ({
                        ...current,
                        yearTo: trimmed.length === 0 ? null : Number.parseInt(trimmed, 10) || null,
                      }));
                    }}
                    placeholder="e.g. 2024"
                    keyboardType="number-pad"
                    maxLength={4}
                  />
                </View>
              </View>
            ) : (
              <AppInput
                label="Year"
                value={draft.year != null ? String(draft.year) : ''}
                onChangeText={(text) => {
                  const trimmed = text.trim();
                  setDraft((current) => ({
                    ...current,
                    year: trimmed.length === 0 ? null : Number.parseInt(trimmed, 10) || null,
                  }));
                }}
                placeholder="e.g. 2020"
                keyboardType="number-pad"
                maxLength={4}
              />
            )}

            <AppInput
              label="Minimum rating"
              value={draft.minRating != null ? String(draft.minRating) : ''}
              onChangeText={(text) => {
                const trimmed = text.trim();
                setDraft((current) => ({
                  ...current,
                  minRating: trimmed.length === 0 ? null : Number.parseFloat(trimmed) || null,
                }));
              }}
              placeholder="0–10"
              keyboardType="decimal-pad"
              maxLength={4}
            />

            <View style={styles.section}>
              <AppText variant="bodySmall" style={styles.sectionLabel}>Runtime</AppText>
              <RuntimeSelector
                minRuntimeMinutes={draft.minRuntimeMinutes}
                maxRuntimeMinutes={draft.maxRuntimeMinutes}
                onChange={(min, max) =>
                  setDraft((current) => ({
                    ...current,
                    minRuntimeMinutes: min,
                    maxRuntimeMinutes: max,
                  }))
                }
              />
            </View>

            <AppInput
              label="Original language"
              value={draft.originalLanguage ?? ''}
              onChangeText={(text) =>
                setDraft((current) => ({
                  ...current,
                  originalLanguage: text.trim().length > 0 ? text.trim().toLowerCase() : null,
                }))
              }
              placeholder="e.g. en"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={8}
            />

            <AppInput
              label="Origin country"
              value={draft.originCountry ?? ''}
              onChangeText={(text) =>
                setDraft((current) => ({
                  ...current,
                  originCountry:
                    text.trim().length === 2 ? text.trim().toUpperCase() : text.trim() || null,
                }))
              }
              placeholder="e.g. US"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={2}
            />

            <View style={styles.section}>
              <AppText variant="bodySmall" style={styles.sectionLabel}>Streaming</AppText>
              <WatchProviderSelector
                providers={providersQuery.data?.providers ?? []}
                selectedProviderIds={draft.watchProviderIds}
                isLoading={providersQuery.isLoading}
                isError={providersQuery.isError}
                onRetry={() => void providersQuery.refetch()}
                onToggle={(providerId) =>
                  setDraft((current) => ({
                    ...current,
                    watchProviderIds: current.watchProviderIds.includes(providerId)
                      ? current.watchProviderIds.filter((id) => id !== providerId)
                      : [...current.watchProviderIds, providerId],
                  }))
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

            <View style={styles.section}>
              <AppText variant="bodySmall" style={styles.sectionLabel}>Sort by</AppText>
              <SortSelector
                value={draft.sort ?? 'popularity_desc'}
                onChange={(sort) => setDraft((current) => ({ ...current, sort }))}
              />
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <AppButton title="Reset" variant="secondary" onPress={handleClear} />
            <AppButton title="Show Results" onPress={handleApply} />
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    gap: spacing.md,
    paddingBottom: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  sectionLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
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
    minHeight: 36,
    justifyContent: 'center',
  },
  filterChipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  filterChipLabel: {
    color: colors.textPrimary,
  },
  filterChipLabelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  actions: {
    gap: spacing.sm,
  },
});
