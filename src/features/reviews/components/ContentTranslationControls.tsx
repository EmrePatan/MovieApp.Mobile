import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View, type TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { UseQueryResult } from '@tanstack/react-query';
import { AppText } from '@/components/common/AppText';
import { getLanguageLabel, normalizeDeviceLanguageCode } from '@/i18n/locale-tags';
import { getUiFormatLocaleTag } from '@/i18n';
import { useLocalePreference } from '@/features/locale/hooks/useLocalePreference';
import { useAppConfig } from '@/features/app-config/hooks/useAppConfig';
import { shouldShowReviewTranslationAction } from '../utils/review-locale';
import type { ReviewTranslationResponse } from '../types';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';

interface ContentTranslationControlsProps {
  content: string;
  authoringLocale?: string | null;
  textVariant?: 'body' | 'bodySmall' | 'caption';
  contentStyle?: TextStyle;
  translationQuery: UseQueryResult<ReviewTranslationResponse, Error>;
  fetchTranslation: () => void;
  numberOfLines?: number;
}

export function ContentTranslationControls({
  content,
  authoringLocale,
  textVariant = 'bodySmall',
  contentStyle,
  translationQuery,
  fetchTranslation,
  numberOfLines,
}: ContentTranslationControlsProps) {
  const { t } = useTranslation();
  const { config } = useAppConfig();
  const { language } = useLocalePreference();
  const currentContentLocale = getUiFormatLocaleTag();
  const [showTranslated, setShowTranslated] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const shouldShowAction = useMemo(
    () => !dismissed && shouldShowReviewTranslationAction(authoringLocale, currentContentLocale),
    [authoringLocale, currentContentLocale, dismissed],
  );

  const sourceMatchesTarget = translationQuery.data?.outcome === 'SourceMatchesTarget';
  const translatedText = translationQuery.data?.translatedText ?? null;
  const canShowTranslated = showTranslated && !sourceMatchesTarget && Boolean(translatedText);
  const displayContent = canShowTranslated ? translatedText! : content.trim();

  const detectedSourceLanguage = translationQuery.data?.detectedSourceLanguage;
  const sourceLanguageLabel = detectedSourceLanguage
    ? getLanguageLabel(normalizeDeviceLanguageCode(detectedSourceLanguage), language)
    : null;

  const handleSeeTranslation = () => {
    if (sourceMatchesTarget) {
      setDismissed(true);
      setShowTranslated(false);
      return;
    }
    if (translatedText) {
      setShowTranslated(true);
      return;
    }
    fetchTranslation();
    setShowTranslated(true);
  };

  const handleSeeOriginal = () => setShowTranslated(false);

  const showToggleAction =
    shouldShowAction && !translationQuery.isFetching && !translationQuery.isError;

  if (!config.features.reviewTranslation) {
    return (
      <AppText variant={textVariant} style={[styles.content, contentStyle]} numberOfLines={numberOfLines}>
        {content.trim()}
      </AppText>
    );
  }

  if (!shouldShowAction && !translationQuery.isFetching && !translationQuery.data) {
    return (
      <AppText variant={textVariant} style={[styles.content, contentStyle]} numberOfLines={numberOfLines}>
        {content.trim()}
      </AppText>
    );
  }

  return (
    <View style={styles.container}>
      <AppText variant={textVariant} style={[styles.content, contentStyle]} numberOfLines={numberOfLines}>
        {displayContent}
      </AppText>
      {canShowTranslated && sourceLanguageLabel ? (
        <AppText variant="caption" muted style={styles.metadata}>
          {t('reviews.translatedFrom', { language: sourceLanguageLabel })}
        </AppText>
      ) : null}
      {translationQuery.isFetching ? (
        <View style={styles.inlineStatus}>
          <ActivityIndicator size="small" color={colors.textMuted} />
          <AppText variant="caption" muted>
            {t('reviews.translating')}
          </AppText>
        </View>
      ) : null}
      {translationQuery.isError ? (
        <View style={styles.inlineStatus}>
          <AppText variant="caption" muted>
            {t('reviews.translationUnavailable')}
          </AppText>
          <Pressable
            onPress={fetchTranslation}
            hitSlop={4}
            style={styles.actionButton}
            testID="review-translation-retry"
          >
            <AppText variant="caption" style={styles.actionLabel}>
              {t('reviews.tryAgain')}
            </AppText>
          </Pressable>
        </View>
      ) : null}
      {showToggleAction ? (
        canShowTranslated ? (
          <Pressable
            onPress={handleSeeOriginal}
            hitSlop={4}
            style={styles.actionButton}
            testID="review-see-original"
          >
            <View style={styles.actionRow}>
              <Ionicons name="eye-outline" size={14} color={colors.accent} />
              <AppText variant="caption" style={styles.actionLabel}>
                {t('reviews.seeOriginal')}
              </AppText>
            </View>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleSeeTranslation}
            hitSlop={4}
            style={styles.actionButton}
            testID="review-see-translation"
          >
            <View style={styles.actionRow}>
              <Ionicons name="language-outline" size={14} color={colors.accent} />
              <AppText variant="caption" style={styles.actionLabel}>
                {t('reviews.seeTranslation')}
              </AppText>
            </View>
          </Pressable>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 2 },
  content: {
    lineHeight: 22,
    color: colors.textPrimary,
  },
  metadata: { fontSize: 11, lineHeight: 13 },
  inlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    alignSelf: 'flex-start',
    marginTop: -2,
    paddingVertical: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    color: colors.accent,
    fontWeight: '600',
    fontSize: 11,
  },
  pressed: { opacity: interaction.pressedOpacity },
});