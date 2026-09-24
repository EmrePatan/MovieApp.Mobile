import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { getUiFormatLocaleTag } from '@/i18n';
import { getLanguageLabel, normalizeDeviceLanguageCode } from '@/i18n/locale-tags';
import { useLocalePreference } from '@/features/locale/hooks/useLocalePreference';
import { useReviewTranslation } from '../hooks/useReviewTranslation';
import type { ReviewResponse } from '../types';
import { shouldShowReviewTranslationAction } from '../utils/review-locale';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';

interface ReviewTranslationControlsProps {
  review: ReviewResponse;
  numberOfLines?: number;
}

export function ReviewTranslationControls({
  review,
  numberOfLines,
}: ReviewTranslationControlsProps) {
  const { t } = useTranslation();
  const { language } = useLocalePreference();
  const currentContentLocale = getUiFormatLocaleTag();
  const [showTranslated, setShowTranslated] = useState(false);
  const [requestTranslation, setRequestTranslation] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const shouldShowAction = useMemo(
    () => !dismissed && shouldShowReviewTranslationAction(review.authoringLocale, currentContentLocale),
    [currentContentLocale, dismissed, review.authoringLocale],
  );

  const translationQuery = useReviewTranslation(review, requestTranslation && shouldShowAction);

  const sourceMatchesTarget =
    translationQuery.data?.outcome === 'SourceMatchesTarget';

  const translatedText = translationQuery.data?.translatedText ?? null;
  const canShowTranslated =
    showTranslated &&
    !sourceMatchesTarget &&
    Boolean(translatedText);

  const displayContent = canShowTranslated ? translatedText! : review.content.trim();

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

    setRequestTranslation(true);
    setShowTranslated(true);
  };

  const handleSeeOriginal = () => {
    setShowTranslated(false);
  };

  const handleRetry = () => {
    setRequestTranslation(true);
    translationQuery.refetch();
  };

  const showToggleAction =
    shouldShowAction &&
    !translationQuery.isFetching &&
    !translationQuery.isError;

  if (!shouldShowAction && !translationQuery.isFetching && !translationQuery.data) {
    return (
      <AppText variant="bodySmall" style={styles.content} numberOfLines={numberOfLines}>
        {review.content.trim()}
      </AppText>
    );
  }

  return (
    <View style={styles.container}>
      <AppText variant="bodySmall" style={styles.content} numberOfLines={numberOfLines}>
        {displayContent}
      </AppText>

      {canShowTranslated && sourceLanguageLabel ? (
        <AppText variant="caption" muted style={styles.metadata}>
          {t('reviews.translatedFrom', { language: sourceLanguageLabel })}
        </AppText>
      ) : null}

      {translationQuery.isFetching ? (
        <View
          style={styles.inlineStatus}
          accessibilityRole="progressbar"
          accessibilityLabel={t('reviews.translating')}
        >
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
            accessibilityRole="button"
            accessibilityLabel={t('reviews.retryTranslationAccessibility')}
            onPress={handleRetry}
            hitSlop={4}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
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
            accessibilityRole="button"
            accessibilityLabel={t('reviews.seeOriginalAccessibility')}
            onPress={handleSeeOriginal}
            hitSlop={4}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
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
            accessibilityRole="button"
            accessibilityLabel={t('reviews.seeTranslationAccessibility')}
            onPress={handleSeeTranslation}
            hitSlop={4}
            style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
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
  container: {
    gap: 2,
  },
  content: {
    lineHeight: 22,
    color: colors.textPrimary,
    letterSpacing: 0.12,
    fontSize: 14,
    fontWeight: '400',
  },
  metadata: {
    fontSize: 11,
    lineHeight: 13,
    marginTop: -1,
  },
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
    minHeight: 0,
    justifyContent: 'center',
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
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
