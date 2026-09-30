import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { AppInput } from '@/components/inputs/AppInput';
import { AppText } from '@/components/common/AppText';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDiscoveryKeywords } from '@/features/discovery/hooks/useDiscoveryKeywords';
import type { DiscoveryKeywordItem } from '@/features/discovery/keyword-types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface CatalogKeywordSelectorPanelProps {
  selectedIds: string[];
  selectedLabels: Record<string, string>;
  onChange: (next: { ids: string[]; labels: Record<string, string> }) => void;
  active: boolean;
  testID?: string;
}

export function CatalogKeywordSelectorPanel({
  selectedIds,
  selectedLabels,
  onChange,
  active,
  testID,
}: CatalogKeywordSelectorPanelProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const keywordsQuery = useDiscoveryKeywords(debouncedQuery, active);

  const selectedItems = useMemo(
    () =>
      selectedIds.map((id) => ({
        id,
        name: selectedLabels[id] ?? id,
      })),
    [selectedIds, selectedLabels],
  );

  const toggleKeyword = (item: DiscoveryKeywordItem) => {
    if (selectedIds.includes(item.id)) {
      const nextIds = selectedIds.filter((id) => id !== item.id);
      const nextLabels = { ...selectedLabels };
      delete nextLabels[item.id];
      onChange({ ids: nextIds, labels: nextLabels });
      return;
    }

    onChange({
      ids: [...selectedIds, item.id],
      labels: { ...selectedLabels, [item.id]: item.name },
    });
  };

  return (
    <View style={styles.root} testID={testID}>
      <AppInput
        label={t('discovery.catalogFilters.keywordSearchLabel')}
        value={query}
        onChangeText={setQuery}
        placeholder={t('discovery.catalogFilters.keywordSearchPlaceholder')}
        autoCapitalize="none"
        autoCorrect={false}
      />

      {selectedItems.length > 0 ? (
        <View style={styles.selectedSection}>
          <AppText variant="bodySmall" muted>
            {t('discovery.catalogFilters.selectedKeywords')}
          </AppText>
          {selectedItems.map((item) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected: true }}
              accessibilityLabel={item.name}
              onPress={() => toggleKeyword(item)}
              style={styles.optionRowSelected}
            >
              <AppText variant="body" style={styles.optionLabelSelected}>
                {item.name}
              </AppText>
              <Ionicons name="checkmark" size={20} color={colors.accent} />
            </Pressable>
          ))}
        </View>
      ) : null}

      <ScrollView
        style={styles.resultsScroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
        showsVerticalScrollIndicator
      >
        {keywordsQuery.isLoading ? <ActivityIndicator color={colors.accent} /> : null}

        {keywordsQuery.isError ? (
          <AppText variant="bodySmall" muted>
            {t('discovery.catalogFilters.keywordSearchError')}
          </AppText>
        ) : null}

        {!keywordsQuery.isLoading &&
        !keywordsQuery.isError &&
        debouncedQuery.trim().length > 0 &&
        (keywordsQuery.data?.items.length ?? 0) === 0 ? (
          <AppText variant="bodySmall" muted>
            {t('discovery.catalogFilters.keywordSearchEmpty')}
          </AppText>
        ) : null}

        {(keywordsQuery.data?.items ?? []).map((item) => {
          const selected = selectedIds.includes(item.id);

          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={item.name}
              onPress={() => toggleKeyword(item)}
              style={({ pressed }) => [
                styles.optionRow,
                selected && styles.optionRowSelected,
                pressed && styles.pressed,
              ]}
            >
              <AppText variant="body" style={selected ? styles.optionLabelSelected : undefined}>
                {item.name}
              </AppText>
              {selected ? <Ionicons name="checkmark" size={20} color={colors.accent} /> : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** @deprecated Use CatalogKeywordSelectorPanel inside CatalogFilterSheetShell. */
export function CatalogKeywordSelector(
  props: CatalogKeywordSelectorPanelProps & {
    visible: boolean;
    onClose: () => void;
  },
) {
  const { visible, onClose, ...panelProps } = props;
  if (!visible) {
    return null;
  }

  return <CatalogKeywordSelectorPanel {...panelProps} active={visible} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 0,
  },
  resultsScroll: {
    flex: 1,
    minHeight: 0,
    marginTop: spacing.sm,
  },
  selectedSection: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  content: {
    gap: spacing.xs,
    paddingBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  optionRow: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  optionRowSelected: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentTint12,
  },
  optionLabelSelected: {
    color: colors.accent,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
