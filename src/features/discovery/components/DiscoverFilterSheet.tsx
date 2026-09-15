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
import { useGenres } from '../hooks/useGenres';
import {
  DISCOVERY_SORT_OPTIONS,
  getDefaultSortForMode,
  type DiscoveryBrowseFilters,
  type DiscoveryBrowseMode,
  type DiscoverySort,
  type Genre,
} from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface DiscoverFilterSheetProps {
  visible: boolean;
  mode: DiscoveryBrowseMode;
  filters: DiscoveryBrowseFilters;
  onClose: () => void;
  onApply: (filters: DiscoveryBrowseFilters) => void;
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

function SortSelector({
  value,
  onChange,
}: {
  value: DiscoverySort;
  onChange: (value: DiscoverySort) => void;
}) {
  return (
    <View style={styles.chipGrid}>
      {DISCOVERY_SORT_OPTIONS.map((option) => {
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

export function DiscoverFilterSheet({
  visible,
  mode,
  filters,
  onClose,
  onApply,
  onClear,
}: DiscoverFilterSheetProps) {
  const genresQuery = useGenres();
  const wasVisibleRef = useRef(false);
  const [draft, setDraft] = useState<DiscoveryBrowseFilters>(filters);

  useEffect(() => {
    if (visible && !wasVisibleRef.current) {
      setDraft(filters);
    }

    wasVisibleRef.current = visible;
  }, [visible, filters]);

  const handleClose = () => {
    onClose();
  };

  const handleApply = () => {
    onApply(draft);
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

    setDraft(cleared);
    onClear();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet} edges={['bottom']}>
          <View style={styles.header}>
            <AppText variant="subtitle">Filters</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={handleClose}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
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

            <AppInput
              label="Language"
              value={draft.language ?? ''}
              onChangeText={(text) =>
                setDraft((current) => ({
                  ...current,
                  language: text.trim().length > 0 ? text.trim().toLowerCase() : null,
                }))
              }
              placeholder="e.g. en"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={8}
            />

            <View style={styles.section}>
              <AppText variant="bodySmall" style={styles.sectionLabel}>Sort by</AppText>
              <SortSelector
                value={draft.sort ?? getDefaultSortForMode(mode)}
                onChange={(sort) => setDraft((current) => ({ ...current, sort }))}
              />
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <AppButton title="Clear filters" variant="secondary" onPress={handleClear} />
            <AppButton title="Apply filters" onPress={handleApply} />
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
    fontWeight: '600',
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  filterChip: {
    minHeight: 32,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipSelected: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterChipLabel: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  filterChipLabelSelected: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  actions: {
    gap: spacing.sm,
  },
});
