import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  translateDiscoverySort,
  translateDiscoveryTypeFilter,
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
import { useGenres } from '../hooks/useGenres';
import {
  DISCOVERY_SORT_OPTIONS,
  DISCOVERY_TYPE_OPTIONS,
  getDefaultSortForMode,
  type DiscoveryBrowseFilters,
  type DiscoveryBrowseMode,
  type DiscoverySort,
  type DiscoveryTypeFilter,
  type Genre,
} from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface DiscoverFilterSheetProps {
  visible: boolean;
  mode: DiscoveryBrowseMode;
  type: DiscoveryTypeFilter;
  filters: DiscoveryBrowseFilters;
  onClose: () => void;
  onApply: (type: DiscoveryTypeFilter, filters: DiscoveryBrowseFilters) => void;
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

function TypeSelector({
  value,
  onChange,
  contentTypeAccessibilityLabel,
}: {
  value: DiscoveryTypeFilter;
  onChange: (value: DiscoveryTypeFilter) => void;
  contentTypeAccessibilityLabel: (label: string) => string;
}) {
  return (
    <View style={styles.chipGrid}>
      {DISCOVERY_TYPE_OPTIONS.map((typeOption) => {
        const selected = typeOption === value;
        const label = translateDiscoveryTypeFilter(typeOption);

        return (
          <Pressable
            key={typeOption}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={contentTypeAccessibilityLabel(label)}
            onPress={() => onChange(typeOption)}
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
  value: DiscoverySort;
  onChange: (value: DiscoverySort) => void;
  sortAccessibilityLabel: (label: string) => string;
}) {
  return (
    <View style={styles.chipGrid}>
      {DISCOVERY_SORT_OPTIONS.map((sortOption) => {
        const selected = sortOption === value;
        const label = translateDiscoverySort(sortOption);

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

export function DiscoverFilterSheet({
  visible,
  mode,
  type,
  filters,
  onClose,
  onApply,
  onClear,
}: DiscoverFilterSheetProps) {
  const { t } = useTranslation();
  const genresQuery = useGenres();
  const wasVisibleRef = useRef(false);
  const [draftType, setDraftType] = useState<DiscoveryTypeFilter>(type);
  const [draft, setDraft] = useState<DiscoveryBrowseFilters>(filters);

  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      setDraftType(type);
      setDraft(filters);
    }

    wasVisibleRef.current = visible;
  }, [visible, filters, type]);

  const handleClose = () => {
    onClose();
  };

  const handleApply = () => {
    onApply(draftType, draft);
    onClose();
  };

  const handleClear = () => {
    const cleared: DiscoveryBrowseFilters = {
      genreIds: [],
      year: null,
      minRating: null,
      language: null,
      sort: getDefaultSortForMode(mode),
    };

    setDraftType('all');
    setDraft(cleared);
    onClear();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.header}>
            <AppText variant="subtitle">{t('discovery.filterSheet.title')}</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.section}>
              <AppText variant="bodySmall" style={styles.sectionLabel}>{t('discovery.filterSheet.contentTypeSection')}</AppText>
              <TypeSelector
                value={draftType}
                onChange={setDraftType}
                contentTypeAccessibilityLabel={(label) => t('common.contentTypeLabel', { label })}
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
            </View>

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
              label={t('common.language')}
              value={draft.language ?? ''}
              onChangeText={(text) =>
                setDraft((current) => ({
                  ...current,
                  language: text.trim().length > 0 ? text.trim().toLowerCase() : null,
                }))
              }
              placeholder={t('common.placeholderLanguageExample')}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={8}
            />

            <View style={styles.section}>
              <AppText variant="bodySmall" style={styles.sectionLabel}>{t('discovery.filterSheet.sortSection')}</AppText>
              <SortSelector
                value={draft.sort ?? getDefaultSortForMode(mode)}
                sortAccessibilityLabel={(label) => t('common.sortByLabel', { label })}
                onChange={(sort) => setDraft((current) => ({ ...current, sort }))}
              />
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <AppButton title={t('discovery.filterSheet.reset')} variant="secondary" onPress={handleClear} />
            <AppButton title={t('discovery.filterSheet.showResults')} onPress={handleApply} />
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
