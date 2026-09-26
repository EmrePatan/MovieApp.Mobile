import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { memo, useMemo, type ComponentProps } from 'react';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import type { SearchAutocompleteItem } from '../types';
import { formatContentType, formatKnownForDepartment } from '@/utils/format';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';

const AUTOCOMPLETE_THUMB_WIDTH = 36;
const AUTOCOMPLETE_THUMB_HEIGHT = 54;
const AUTOCOMPLETE_PERSON_THUMB_SIZE = 36;

function formatSuggestionTypeLabel(suggestion: SearchAutocompleteItem): string {
  if (suggestion.type === 'person') {
    const department = formatKnownForDepartment(suggestion.knownForDepartment);
    const typeLabel = formatContentType('person');
    return department ? `${typeLabel} · ${department}` : typeLabel;
  }

  return formatContentType(suggestion.type);
}

function SearchSuggestionLeadingVisual({
  suggestion,
  t,
}: {
  suggestion: SearchAutocompleteItem;
  t: TFunction;
}) {
  if (suggestion.type === 'person') {
    if (suggestion.posterUrl) {
      return (
        <PosterImage
          uri={suggestion.posterUrl}
          width={AUTOCOMPLETE_PERSON_THUMB_SIZE}
          height={AUTOCOMPLETE_PERSON_THUMB_SIZE}
          accessibilityLabel={t('details.sections.personPortrait', { name: suggestion.title })}
        />
      );
    }

    return (
      <View
        style={styles.personLeadingIcon}
        accessibilityLabel={t('search.suggestions.personSuggestion')}
      >
        <Ionicons name="person-outline" size={20} color={colors.textSecondary} />
      </View>
    );
  }

  if (suggestion.posterUrl) {
    return (
      <PosterImage
        uri={suggestion.posterUrl}
        width={AUTOCOMPLETE_THUMB_WIDTH}
        height={AUTOCOMPLETE_THUMB_HEIGHT}
        accessibilityLabel={t('common.posterAccessibility', { title: suggestion.title })}
      />
    );
  }

  const iconName: ComponentProps<typeof Ionicons>['name'] =
    suggestion.type === 'tv' ? 'tv-outline' : 'film-outline';

  return (
    <View
      style={styles.leadingIcon}
      accessibilityLabel={
        suggestion.type === 'tv'
          ? t('search.suggestions.tvSuggestion')
          : t('search.suggestions.movieSuggestion')
      }
    >
      <Ionicons name={iconName} size={20} color={colors.textSecondary} />
    </View>
  );
}

interface SearchSuggestionListProps {
  suggestions: SearchAutocompleteItem[];
  isLoading: boolean;
  onSelect: (suggestion: SearchAutocompleteItem) => void;
  testID?: string;
}

export function searchSuggestionKeyExtractor(suggestion: SearchAutocompleteItem): string {
  return `${suggestion.type}-${suggestion.id}`;
}

function SearchSuggestionRow({
  suggestion,
  isLast,
  onSelect,
}: {
  suggestion: SearchAutocompleteItem;
  isLast: boolean;
  onSelect: (suggestion: SearchAutocompleteItem) => void;
}) {
  const { t } = useTranslation();
  const typeLabel = formatSuggestionTypeLabel(suggestion);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t('search.suggestions.searchForTitleType', {
        title: suggestion.title,
        type: typeLabel,
      })}
      onPress={() => onSelect(suggestion)}
      style={({ pressed }) => [
        styles.row,
        !isLast && styles.rowBorder,
        pressed && styles.pressed,
      ]}
    >
      <SearchSuggestionLeadingVisual suggestion={suggestion} t={t} />
      <AppText variant="bodySmall" numberOfLines={1} style={styles.title}>
        {suggestion.title}
      </AppText>
      <AppText variant="caption" muted style={styles.typeLabel}>
        {typeLabel}
      </AppText>
    </Pressable>
  );
}

export const SearchSuggestionList = memo(function SearchSuggestionList({
  suggestions,
  isLoading,
  onSelect,
  testID = 'search-suggestions-list',
}: SearchSuggestionListProps) {
  const { t } = useTranslation();

  const listEmpty = useMemo(() => {
    if (isLoading && suggestions.length === 0) {
      return (
        <View style={styles.loading} accessibilityLabel={t('common.loadingSuggestions')}>
          <ActivityIndicator color={colors.accent} size="small" />
        </View>
      );
    }

    if (suggestions.length === 0) {
      return (
        <View style={styles.empty} accessibilityLabel={t('search.suggestions.empty')}>
          <AppText variant="caption" muted>{t('search.suggestions.empty')}</AppText>
        </View>
      );
    }

    return null;
  }, [isLoading, suggestions.length, t]);

  return (
    <FlatList
      testID={testID}
      data={suggestions}
      keyExtractor={searchSuggestionKeyExtractor}
      renderItem={({ item, index }) => (
        <SearchSuggestionRow
          suggestion={item}
          isLast={index === suggestions.length - 1}
          onSelect={onSelect}
        />
      )}
      ListEmptyComponent={listEmpty}
      keyboardDismissMode="on-drag"
      keyboardShouldPersistTaps="handled"
      style={styles.list}
      contentContainerStyle={[
        styles.listContent,
        suggestions.length > 0 && styles.listContentWithItems,
      ]}
      accessibilityRole="list"
      showsVerticalScrollIndicator={false}
    />
  );
});

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: spacing.xxl,
  },
  listContentWithItems: {
    marginTop: spacing.xs,
    borderRadius: spacing.sm,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  loading: {
    marginTop: spacing.xs,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  empty: {
    marginTop: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    borderRadius: spacing.sm,
    backgroundColor: colors.surfaceElevated,
  },
  leadingIcon: {
    width: AUTOCOMPLETE_THUMB_WIDTH,
    height: AUTOCOMPLETE_THUMB_HEIGHT,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.inputBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personLeadingIcon: {
    width: AUTOCOMPLETE_PERSON_THUMB_SIZE,
    height: AUTOCOMPLETE_PERSON_THUMB_SIZE,
    borderRadius: AUTOCOMPLETE_PERSON_THUMB_SIZE / 2,
    backgroundColor: colors.inputBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: AUTOCOMPLETE_THUMB_HEIGHT + spacing.sm * 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.surface,
    opacity: interaction.pressedOpacity,
  },
  title: {
    flex: 1,
  },
  typeLabel: {
    letterSpacing: 0.2,
  },
});
