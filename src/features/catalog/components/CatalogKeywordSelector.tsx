import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
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
  const searchInputRef = useRef<TextInput>(null);
  const debouncedQuery = useDebouncedValue(query, 300);
  const keywordsQuery = useDiscoveryKeywords(debouncedQuery, active);

  useEffect(() => {
    if (!active) {
      return;
    }

    const focusTimer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 400);

    return () => clearTimeout(focusTimer);
  }, [active]);

  const uniqueSelectedIds = useMemo(
    () => Array.from(new Set(selectedIds.filter((id) => id.length > 0))),
    [selectedIds],
  );

  const selectedItems = useMemo(
    () =>
      uniqueSelectedIds.map((id) => ({
        id,
        name: selectedLabels[id] ?? id,
      })),
    [uniqueSelectedIds, selectedLabels],
  );

  const toggleKeyword = (item: DiscoveryKeywordItem) => {
    const canonicalId = item.id;

    if (uniqueSelectedIds.includes(canonicalId)) {
      const nextIds = uniqueSelectedIds.filter((id) => id !== canonicalId);
      const nextLabels = { ...selectedLabels };
      delete nextLabels[canonicalId];
      onChange({ ids: nextIds, labels: nextLabels });
      return;
    }

    onChange({
      ids: [...uniqueSelectedIds, canonicalId],
      labels: { ...selectedLabels, [canonicalId]: item.name },
    });
  };

  const visibleSearchResults = useMemo(() => {
    const items = keywordsQuery.data?.items ?? [];
    const selected = new Set(uniqueSelectedIds);
    return items.filter((item) => !selected.has(item.id));
  }, [keywordsQuery.data?.items, uniqueSelectedIds]);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
    >
      <View style={styles.searchBlock} testID={testID}>
        <AppInput
          ref={searchInputRef}
          label={t('discovery.catalogFilters.keywordSearchLabel')}
          value={query}
          onChangeText={setQuery}
          placeholder={t('discovery.catalogFilters.keywordSearchPlaceholder')}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

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
        keyboardDismissMode="on-drag"
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

        {visibleSearchResults.map((item) => (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityState={{ selected: false }}
            accessibilityLabel={item.name}
            onPress={() => toggleKeyword(item)}
            style={({ pressed }) => [styles.optionRow, pressed && styles.pressed]}
          >
            <AppText variant="body">{item.name}</AppText>
          </Pressable>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
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
  searchBlock: {
    flexShrink: 0,
  },
  selectedSection: {
    gap: spacing.xs,
    marginTop: spacing.sm,
    flexShrink: 0,
  },
  resultsScroll: {
    flex: 1,
    minHeight: 0,
    marginTop: spacing.sm,
  },
  content: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
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
