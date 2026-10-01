import { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import { AppText } from '@/components/common/AppText';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { openKeywordDiscoverBrowse } from '../navigation/detail-keyword-navigation';
import type {
  CatalogKeywordSummary,
  DetailKeywordsApiPayload,
} from '../types/catalog-keyword';
import {
  isDiscoverableDetailKeyword,
  normalizeDetailKeywords,
} from '../utils/normalize-detail-keywords';
import { limitKeywordsForDetailRail } from '../utils/detail-keyword-rail';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface DetailKeywordsProps {
  keywords: DetailKeywordsApiPayload;
}

function keywordChipKey(keyword: CatalogKeywordSummary, index: number): string {
  return keyword.id ?? `legacy-${index}-${keyword.name}`;
}

function KeywordChip({
  keyword,
  onPress,
}: {
  keyword: CatalogKeywordSummary;
  onPress: (keyword: CatalogKeywordSummary) => void;
}) {
  const discoverable = isDiscoverableDetailKeyword(keyword);

  if (!discoverable) {
    return (
      <View
        style={styles.chip}
        accessibilityRole="text"
        accessibilityLabel={keyword.name}
      >
        <AppText variant="caption">{keyword.name}</AppText>
      </View>
    );
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={keyword.name}
      onPress={() => onPress(keyword)}
      style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
    >
      <AppText variant="caption">{keyword.name}</AppText>
    </Pressable>
  );
}

function KeywordRow({
  keywords,
  onPress,
  testID,
}: {
  keywords: CatalogKeywordSummary[];
  onPress: (keyword: CatalogKeywordSummary) => void;
  testID?: string;
}) {
  if (keywords.length === 0) {
    return null;
  }

  return (
    <View style={styles.row} testID={testID}>
      {keywords.map((keyword, index) => (
        <KeywordChip
          key={keywordChipKey(keyword, index)}
          keyword={keyword}
          onPress={onPress}
        />
      ))}
    </View>
  );
}

export function DetailKeywords({ keywords }: DetailKeywordsProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const normalizedKeywords = useMemo(
    () => normalizeDetailKeywords(keywords),
    [keywords],
  );

  const handleKeywordPress = useCallback(
    (keyword: CatalogKeywordSummary) => {
      openKeywordDiscoverBrowse(router, keyword);
    },
    [router],
  );

  if (normalizedKeywords.length === 0) {
    return null;
  }

  const limited = limitKeywordsForDetailRail(normalizedKeywords);

  return (
    <View style={styles.section} testID="detail-keywords-section">
      <HomeSectionHeader title={t('details.sections.keywords')} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        testID="detail-keywords-scroll"
      >
        <KeywordRow
          keywords={limited}
          onPress={handleKeywordPress}
          testID="detail-keywords-row"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: spacing.sm,
  },
  chip: {
    flexShrink: 0,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  chipPressed: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentTint12,
  },
});
