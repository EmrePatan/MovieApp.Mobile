import { useCallback, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { getApiErrorDisplayMessage, isApiError } from '@/api/errors';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { openCatalogDetailFromTab } from '@/features/details/shared/navigation/open-catalog-detail-from-tab';
import { PRODUCT_METRICS } from '@/features/metrics/product-metric-types';
import { trackProductMetric } from '@/features/metrics/track-product-metric';
import type { RecommendationItem } from '@/features/recommendations/types';
import { SearchEmptyState } from '@/features/search/components/SearchEmptyState';
import { useAiRecommendations } from '../hooks/useAiRecommendations';
import { useAiRecommendationQuota } from '../hooks/useAiRecommendationQuota';
import {
  AI_RECOMMENDATION_DAILY_LIMIT,
  AI_RECOMMENDATION_MAX_MESSAGE_LENGTH,
  AI_RECOMMENDATION_MAX_PICKS_PER_REQUEST,
  AI_RECOMMENDATION_SUGGESTED_PROMPT_KEYS,
} from '../types';
import { mapAiRecommendationToRecommendationItem } from '../utils/map-ai-recommendation-item';
import { validateAiRecommendationMessage } from '../utils/validate-ai-message';
import { AiRecommendationResultCard } from './AiRecommendationResultCard';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const RETURN_ROUTE = '/ai-recommendations';

export function AiRecommendationsContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [quotaOverride, setQuotaOverride] = useState<number | undefined>(undefined);
  const quotaQuery = useAiRecommendationQuota();
  const recommendationsMutation = useAiRecommendations();
  const quotaRemaining = quotaOverride ?? quotaQuery.data?.remaining ?? null;

  const trimmedMessage = message.trim();
  const hasTrackedMetricRef = useRef(false);

  const handleSubmit = useCallback(() => {
    const error = validateAiRecommendationMessage(message);
    setValidationError(error);

    if (error) {
      return;
    }

    recommendationsMutation.mutate(
      {
        message: trimmedMessage,
        sessionId,
      },
      {
        onSuccess: (response) => {
          setSessionId(response.sessionId);
          setQuotaOverride(response.quotaRemaining);
          void queryClient.invalidateQueries({ queryKey: ['ai-recommendations', 'quota'] });
          if (!hasTrackedMetricRef.current && response.returnedCount > 0) {
            trackProductMetric(PRODUCT_METRICS.aiRecommendationsUsed);
            hasTrackedMetricRef.current = true;
          }
        },
        onError: (error) => {
          if (isApiError(error) && error.kind === 'rate_limited') {
            setQuotaOverride(0);
          }
        },
      },
    );
  }, [hasTrackedMetricRef, message, queryClient, recommendationsMutation, sessionId, trimmedMessage]);

  const handlePromptPress = useCallback((prompt: string) => {
    setMessage(prompt);
    setValidationError(null);
  }, []);

  const handleItemPress = useCallback(
    (item: RecommendationItem) => {
      openCatalogDetailFromTab(router, item.id, item.type, 'discover', {
        queryClient,
        libraryReturnHref: RETURN_ROUTE,
      });
    },
    [queryClient, router],
  );

  const handleRetry = useCallback(() => {
    recommendationsMutation.reset();
    handleSubmit();
  }, [handleSubmit, recommendationsMutation]);

  const handleStartOver = useCallback(() => {
    setMessage('');
    setSessionId(null);
    setValidationError(null);
    setQuotaOverride(undefined);
    recommendationsMutation.reset();
  }, [recommendationsMutation]);

  const quotaLimit = quotaQuery.data?.limit ?? AI_RECOMMENDATION_DAILY_LIMIT;
  const isQuotaHydrated = quotaRemaining !== null;
  const isQuotaExhausted = isQuotaHydrated && quotaRemaining <= 0;

  const resultItems = useMemo(() => {
    const response = recommendationsMutation.data;
    if (!response) {
      return [];
    }

    return response.recommendations.map(mapAiRecommendationToRecommendationItem);
  }, [recommendationsMutation.data]);

  const statusContent = useMemo(() => {
    if (recommendationsMutation.isPending) {
      return (
        <View style={styles.stateContainer} testID="ai-recommendations-loading">
          <ActivityIndicator size="large" color={colors.accent} />
          <AppText variant="bodySmall" muted center>
            {t('aiRecommendations.loading')}
          </AppText>
        </View>
      );
    }

    if (recommendationsMutation.isError) {
      const error = recommendationsMutation.error;

      if (isApiError(error) && error.kind === 'rate_limited') {
        return (
          <View style={styles.stateContainer} testID="ai-recommendations-quota-exceeded">
            <View style={styles.stateIconWrap}>
              <Ionicons name="hourglass-outline" size={28} color={colors.accent} />
            </View>
            <AppText variant="subtitle" center>
              {t('aiRecommendations.dailyLimitTitle')}
            </AppText>
            <AppText variant="bodySmall" muted center style={styles.stateMessage}>
              {getApiErrorDisplayMessage(
                error,
                t('aiRecommendations.dailyLimitFallback', { limit: AI_RECOMMENDATION_DAILY_LIMIT }),
              )}
            </AppText>
          </View>
        );
      }

      return (
        <View style={styles.stateContainer} testID="ai-recommendations-error">
          <ErrorView
            message={getApiErrorDisplayMessage(
              error,
              t('aiRecommendations.generateError'),
            )}
            onRetry={handleRetry}
            retryLabel={t('common.retry')}
          />
        </View>
      );
    }

    const response = recommendationsMutation.data;
    if (!response) {
      return null;
    }

    if (response.returnedCount === 0) {
      const rejectedCount = response.validationSummary.rejectedCount;

      return (
        <View style={styles.stateContainer} testID="ai-recommendations-empty">
          <SearchEmptyState
            title={t('aiRecommendations.emptyTitle')}
            message={t('aiRecommendations.emptyMessage')}
          />
          {rejectedCount > 0 ? (
            <AppText variant="caption" muted center style={styles.stateMessage}>
              {t('aiRecommendations.emptyRejectedHint', { count: rejectedCount })}
            </AppText>
          ) : null}
          <AppText variant="caption" muted center style={styles.stateMessage}>
            {t('aiRecommendations.emptyDiversityHint', {
              count: AI_RECOMMENDATION_MAX_PICKS_PER_REQUEST,
            })}
          </AppText>
          <AppButton
            title={t('aiRecommendations.tryAnotherPrompt')}
            variant="secondary"
            onPress={handleStartOver}
          />
        </View>
      );
    }

    const rejectedCount = response.validationSummary.rejectedCount;
    const showLowYieldBanner =
      response.returnedCount < response.requestedCount && rejectedCount > 0;

    return (
      <View style={styles.resultsSection} testID="ai-recommendations-results">
        {response.partialResults ? (
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
            <AppText variant="caption" style={styles.infoBannerText}>
              {t('aiRecommendations.partialResults', { count: rejectedCount })}
            </AppText>
          </View>
        ) : null}

        {showLowYieldBanner && !response.partialResults ? (
          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
            <AppText variant="caption" style={styles.infoBannerText}>
              {t('aiRecommendations.lowYieldResults', {
                returned: response.returnedCount,
                max: response.requestedCount,
                count: rejectedCount,
              })}
            </AppText>
          </View>
        ) : null}

        <View style={styles.resultsHeader}>
          <AppText variant="subtitle" accessibilityRole="header">
            {t('aiRecommendations.yourPicks')}
          </AppText>
          <AppText variant="caption" muted>
            {t('aiRecommendations.resultsSummary', {
              returned: response.returnedCount,
              max: response.requestedCount,
              remaining: response.quotaRemaining,
            })}
          </AppText>
          <AppText variant="caption" muted>
            {t('aiRecommendations.maxPicksPerRequest', {
              count: AI_RECOMMENDATION_MAX_PICKS_PER_REQUEST,
            })}
          </AppText>
        </View>

        <View style={styles.resultsList}>
          {resultItems.map((item) => (
            <AiRecommendationResultCard key={item.id} item={item} onPress={handleItemPress} />
          ))}
        </View>

        <View style={styles.actionsSection}>
          <View style={styles.actionBlock}>
            <AppButton
              title={t('aiRecommendations.getMorePicks')}
              variant="secondary"
              onPress={handleSubmit}
              disabled={isQuotaExhausted}
            />
            <AppText variant="caption" muted center style={styles.actionHint}>
              {t('aiRecommendations.getMorePicksHint')}
            </AppText>
          </View>
          <View style={styles.actionBlock}>
            <AppButton
              title={t('aiRecommendations.startFresh')}
              variant="ghost"
              onPress={handleStartOver}
            />
            <AppText variant="caption" muted center style={styles.actionHint}>
              {t('aiRecommendations.startFreshHint')}
            </AppText>
          </View>
        </View>
      </View>
    );
  }, [
    handleItemPress,
    handleRetry,
    handleStartOver,
    handleSubmit,
    isQuotaExhausted,
    recommendationsMutation.data,
    recommendationsMutation.error,
    recommendationsMutation.isError,
    recommendationsMutation.isPending,
    resultItems,
    t,
  ]);

  const response = recommendationsMutation.data;
  const hasCompletedAttempt = !!response && !recommendationsMutation.isPending;
  const showFullComposer =
    !recommendationsMutation.isPending &&
    (!hasCompletedAttempt || recommendationsMutation.isError);
  const showCollapsedPrompt =
    !recommendationsMutation.isPending &&
    hasCompletedAttempt &&
    !recommendationsMutation.isError &&
    trimmedMessage.length > 0;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <DetailBackButton />
          <View style={styles.headerCopy}>
            <View style={styles.titleRow}>
              <Ionicons name="sparkles" size={22} color={colors.accent} />
              <AppText variant="title" accessibilityRole="header">
                {t('discover.hub.aiRecommendations.title')}
              </AppText>
            </View>
            <AppText variant="bodySmall" muted>
              {t('aiRecommendations.subtitle')}
            </AppText>
            <AppText variant="caption" muted testID="ai-recommendations-quota-remaining">
              {isQuotaHydrated
                ? t('aiRecommendations.quotaRemaining', {
                    remaining: quotaRemaining,
                    limit: quotaLimit,
                  })
                : t('aiRecommendations.quotaLoading')}
            </AppText>
          </View>
        </View>

        {showCollapsedPrompt ? (
          <View style={styles.collapsedPromptSection} testID="ai-recommendations-collapsed-prompt">
            <AppText variant="caption" muted style={styles.collapsedPromptLabel}>
              {t('aiRecommendations.sessionPromptLabel')}
            </AppText>
            <AppText variant="bodySmall" numberOfLines={4} style={styles.collapsedPromptText}>
              {trimmedMessage}
            </AppText>
          </View>
        ) : null}

        {showFullComposer ? (
          <View style={styles.composerSection}>
            <AppText variant="bodySmall" style={styles.composerLabel}>
              {t('aiRecommendations.composerLabel')}
            </AppText>
            <TextInput
              accessibilityLabel={t('aiRecommendations.promptAccessibility')}
              multiline
              value={message}
              onChangeText={(next) => {
                if (next.length > AI_RECOMMENDATION_MAX_MESSAGE_LENGTH) {
                  return;
                }

                setMessage(next);
                if (validationError) {
                  setValidationError(null);
                }
              }}
              placeholder={t('aiRecommendations.promptPlaceholder')}
              placeholderTextColor={colors.textMuted}
              style={[styles.promptInput, validationError && styles.promptInputError]}
              textAlignVertical="top"
            />
            <View style={styles.composerMetaRow}>
              <AppText variant="caption" muted>
                {trimmedMessage.length}/{AI_RECOMMENDATION_MAX_MESSAGE_LENGTH}
              </AppText>
              {validationError ? (
                <AppText variant="caption" style={styles.validationError} accessibilityRole="alert">
                  {validationError}
                </AppText>
              ) : null}
            </View>

            <View style={styles.promptChipRow}>
              {AI_RECOMMENDATION_SUGGESTED_PROMPT_KEYS.map((promptKey) => {
                const prompt = t(promptKey);
                return (
                <Pressable
                  key={promptKey}
                  accessibilityRole="button"
                  accessibilityLabel={t('aiRecommendations.usePromptAccessibility', { prompt })}
                  onPress={() => handlePromptPress(prompt)}
                  style={({ pressed }) => [styles.promptChip, pressed && styles.promptChipPressed]}
                >
                  <AppText variant="caption" style={styles.promptChipText}>
                    {prompt}
                  </AppText>
                </Pressable>
              );
              })}
            </View>

          </View>
        ) : null}

        {statusContent}
      </ScrollView>

      {showFullComposer ? (
        <View
          style={[styles.composerFooter, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}
        >
          <AppButton
            title={t('aiRecommendations.getRecommendations')}
            onPress={handleSubmit}
            disabled={recommendationsMutation.isPending || isQuotaExhausted || !isQuotaHydrated}
          />
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  headerCopy: {
    gap: spacing.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  collapsedPromptSection: {
    marginHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  collapsedPromptLabel: {
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontSize: 10,
    lineHeight: 14,
  },
  collapsedPromptText: {
    color: colors.textSecondary,
  },
  composerSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  composerFooter: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.background,
  },
  composerLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
  },
  promptInput: {
    minHeight: 120,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.inputBackground,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body.fontSize,
    lineHeight: 22,
  },
  promptInputError: {
    borderColor: colors.error,
  },
  composerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  validationError: {
    color: colors.error,
    flex: 1,
    textAlign: 'right',
  },
  promptChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  promptChip: {
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  promptChipPressed: {
    opacity: 0.85,
    borderColor: colors.borderAccent,
  },
  promptChipText: {
    color: colors.textSecondary,
  },
  stateContainer: {
    paddingHorizontal: spacing.lg,
    minHeight: 220,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.md,
  },
  stateIconWrap: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentTint12,
  },
  stateMessage: {
    maxWidth: 320,
  },
  resultsSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentTint12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoBannerText: {
    color: colors.accent,
    flex: 1,
    lineHeight: 18,
  },
  resultsHeader: {
    gap: spacing.xs,
  },
  resultsList: {
    gap: spacing.sm,
  },
  actionsSection: {
    gap: spacing.lg,
    paddingTop: spacing.sm,
  },
  actionBlock: {
    gap: spacing.xs,
  },
  actionHint: {
    maxWidth: 320,
    alignSelf: 'center',
  },
});
