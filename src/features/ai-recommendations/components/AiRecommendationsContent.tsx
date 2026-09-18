import { useCallback, useMemo, useRef, useState } from 'react';
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
import {
  AI_RECOMMENDATION_DAILY_LIMIT,
  AI_RECOMMENDATION_MAX_MESSAGE_LENGTH,
  AI_RECOMMENDATION_SUGGESTED_PROMPTS,
} from '../types';
import { mapAiRecommendationToRecommendationItem } from '../utils/map-ai-recommendation-item';
import { validateAiRecommendationMessage } from '../utils/validate-ai-message';
import { AiRecommendationResultCard } from './AiRecommendationResultCard';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const RETURN_ROUTE = '/ai-recommendations';

export function AiRecommendationsContent() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [quotaRemaining, setQuotaRemaining] = useState(AI_RECOMMENDATION_DAILY_LIMIT);
  const recommendationsMutation = useAiRecommendations();

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
          setQuotaRemaining(response.quotaRemaining);
          if (!hasTrackedMetricRef.current && response.returnedCount > 0) {
            trackProductMetric(PRODUCT_METRICS.aiRecommendationsUsed);
            hasTrackedMetricRef.current = true;
          }
        },
        onError: (error) => {
          if (isApiError(error) && error.kind === 'rate_limited') {
            setQuotaRemaining(0);
          }
        },
      },
    );
  }, [hasTrackedMetricRef, message, recommendationsMutation, sessionId, trimmedMessage]);

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
    recommendationsMutation.reset();
  }, [recommendationsMutation]);

  const isQuotaExhausted = quotaRemaining <= 0;

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
            Curating picks from your taste profile...
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
              Daily limit reached
            </AppText>
            <AppText variant="bodySmall" muted center style={styles.stateMessage}>
              {getApiErrorDisplayMessage(
                error,
                `You've used all ${AI_RECOMMENDATION_DAILY_LIMIT} AI recommendation requests for today. Try again tomorrow.`,
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
              'Unable to generate AI recommendations right now.',
            )}
            onRetry={handleRetry}
            retryLabel="Try Again"
          />
        </View>
      );
    }

    const response = recommendationsMutation.data;
    if (!response) {
      return null;
    }

    if (response.returnedCount === 0) {
      return (
        <View style={styles.stateContainer} testID="ai-recommendations-empty">
          <SearchEmptyState
            title="No matches this time"
            message="Try a broader mood, genre, or era. AI suggestions are validated against the MovieApp catalog."
          />
          <AppButton title="Try Another Prompt" variant="secondary" onPress={handleStartOver} />
        </View>
      );
    }

    return (
      <View style={styles.resultsSection} testID="ai-recommendations-results">
        {response.partialResults ? (
          <View style={styles.partialBanner}>
            <Ionicons name="information-circle-outline" size={16} color={colors.accent} />
            <AppText variant="caption" style={styles.partialBannerText}>
              Some suggestions could not be matched to the catalog.
            </AppText>
          </View>
        ) : null}

        <View style={styles.resultsHeader}>
          <AppText variant="subtitle" accessibilityRole="header">
            Your picks
          </AppText>
          <AppText variant="caption" muted>
            {response.returnedCount} of {response.requestedCount} · {response.quotaRemaining} left today
          </AppText>
        </View>

        <View style={styles.resultsList}>
          {resultItems.map((item) => (
            <AiRecommendationResultCard key={item.id} item={item} onPress={handleItemPress} />
          ))}
        </View>

        <AppButton title="Refine This Session" variant="secondary" onPress={handleSubmit} />
        <AppButton title="Start Fresh" variant="ghost" onPress={handleStartOver} />
      </View>
    );
  }, [
    handleItemPress,
    handleRetry,
    handleStartOver,
    handleSubmit,
    recommendationsMutation.data,
    recommendationsMutation.error,
    recommendationsMutation.isError,
    recommendationsMutation.isPending,
    resultItems,
  ]);

  const showComposer = !recommendationsMutation.isPending;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
    >
      <ScrollView
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
                AI Recommendations
              </AppText>
            </View>
            <AppText variant="bodySmall" muted>
              Describe the mood, genre, or vibe you want. Picks are tailored to your taste.
            </AppText>
            <AppText variant="caption" muted testID="ai-recommendations-quota-remaining">
              {quotaRemaining} of {AI_RECOMMENDATION_DAILY_LIMIT} requests left today
            </AppText>
          </View>
        </View>

        {showComposer ? (
          <View style={styles.composerSection}>
            <AppText variant="bodySmall" style={styles.composerLabel}>
              What should we find?
            </AppText>
            <TextInput
              accessibilityLabel="AI recommendation prompt"
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
              placeholder="e.g. A slow-burn thriller with a strong female lead"
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
              {AI_RECOMMENDATION_SUGGESTED_PROMPTS.map((prompt) => (
                <Pressable
                  key={prompt}
                  accessibilityRole="button"
                  accessibilityLabel={`Use prompt: ${prompt}`}
                  onPress={() => handlePromptPress(prompt)}
                  style={({ pressed }) => [styles.promptChip, pressed && styles.promptChipPressed]}
                >
                  <AppText variant="caption" style={styles.promptChipText}>
                    {prompt}
                  </AppText>
                </Pressable>
              ))}
            </View>

            <AppButton
              title={sessionId ? 'Get More Picks' : 'Get Recommendations'}
              onPress={handleSubmit}
              disabled={recommendationsMutation.isPending || isQuotaExhausted}
            />
          </View>
        ) : null}

        {statusContent}
      </ScrollView>
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
  composerSection: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
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
  partialBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.accentTint12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  partialBannerText: {
    color: colors.accent,
    flex: 1,
  },
  resultsHeader: {
    gap: spacing.xs,
  },
  resultsList: {
    gap: spacing.sm,
  },
});
