import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { AppInput } from '@/components/inputs/AppInput';
import { AppText } from '@/components/common/AppText';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useDiscoveryKeywords } from '@/features/discovery/hooks/useDiscoveryKeywords';
import type { DiscoveryKeywordItem } from '@/features/discovery/keyword-types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface CatalogKeywordSelectorProps {
  visible: boolean;
  selectedIds: string[];
  selectedLabels: Record<string, string>;
  onChange: (next: { ids: string[]; labels: Record<string, string> }) => void;
  onClose: () => void;
  testID?: string;
}

export function CatalogKeywordSelector({
  visible,
  selectedIds,
  selectedLabels,
  onChange,
  onClose,
  testID,
}: CatalogKeywordSelectorProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebouncedValue(query, 300);
  const keywordsQuery = useDiscoveryKeywords(debouncedQuery, visible);

  const selectedItems = useMemo(
    () =>
      selectedIds.map((id) => ({
        id,
        name: selectedLabels[id] ?? id,
      })),
    [selectedIds, selectedLabels],
  );

  const handleClose = () => {
    setQuery('');
    onClose();
  };

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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet} edges={['bottom']} testID={testID}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
              onPress={handleClose}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={24} color={colors.textPrimary} />
            </Pressable>
            <AppText variant="subtitle" style={styles.title}>
              {t('discovery.catalogFilters.keywords')}
            </AppText>
            <View style={styles.backButton} />
          </View>

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

          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {keywordsQuery.isLoading ? (
              <ActivityIndicator color={colors.accent} />
            ) : null}

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
    maxHeight: '92%',
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
  backButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
  },
  selectedSection: {
    gap: spacing.xs,
  },
  content: {
    gap: spacing.xs,
    paddingBottom: spacing.md,
  },
  optionRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  optionRowSelected: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
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
