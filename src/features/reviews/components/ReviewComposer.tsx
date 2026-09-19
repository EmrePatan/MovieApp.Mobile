import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { MAX_REVIEW_CONTENT_LENGTH } from '../types';
import { getReviewContentLength } from '../utils/review-content-length';
import {
  hasReviewValidationErrors,
  validateReviewContent,
  type ReviewFormErrors,
} from '../utils/review-validation';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';

interface ReviewComposerProps {
  initialContent?: string;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  autoFocus?: boolean;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
}

const NEAR_LIMIT_RATIO = 0.9;

function ReviewComposerInner({
  initialContent = '',
  submitLabel,
  isSubmitting = false,
  errorMessage = null,
  autoFocus = false,
  onSubmit,
  onCancel,
}: ReviewComposerProps) {
  const { t } = useTranslation();
  const inputRef = useRef<TextInput>(null);
  const [content, setContent] = useState(initialContent);
  const [fieldErrors, setFieldErrors] = useState<ReviewFormErrors>({});
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!autoFocus) {
      return;
    }

    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 280);

    return () => {
      clearTimeout(focusTimer);
    };
  }, [autoFocus]);

  const contentLength = getReviewContentLength(content);
  const isNearLimit = contentLength >= MAX_REVIEW_CONTENT_LENGTH * NEAR_LIMIT_RATIO;
  const hasContent = contentLength > 0;
  const fillRatio = Math.min(contentLength / MAX_REVIEW_CONTENT_LENGTH, 1);

  const handleChangeText = (next: string) => {
    if (getReviewContentLength(next) > MAX_REVIEW_CONTENT_LENGTH) {
      return;
    }

    setContent(next);
    if (fieldErrors.content) {
      setFieldErrors({});
    }
  };

  const handleSubmit = () => {
    const errors = validateReviewContent(content);
    setFieldErrors(errors);

    if (hasReviewValidationErrors(errors)) {
      return;
    }

    onSubmit(content.trim());
  };

  const handleClose = () => {
    inputRef.current?.blur();
    Keyboard.dismiss();
    onCancel?.();
  };

  return (
    <View style={styles.container} testID="review-composer">
      <View style={styles.header}>
        <AppText variant="subtitle" style={styles.headerTitle}>
          {t('reviews.writeReviewTitle')}
        </AppText>
        {onCancel ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.closeComposer')}
            disabled={isSubmitting}
            hitSlop={8}
            onPress={handleClose}
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          >
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>

      <FeedbackMessage
        message={errorMessage}
        tone="error"
        onDismiss={undefined}
      />

      <View
        style={[
          styles.inputFrame,
          isFocused && styles.inputFrameFocused,
          fieldErrors.content && styles.inputFrameError,
        ]}
      >
        <TextInput
          ref={inputRef}
          accessibilityLabel={t('reviews.reviewFieldLabel')}
          multiline
          value={content}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t('reviews.placeholder')}
          placeholderTextColor={colors.textMuted}
          autoCorrect
          style={styles.input}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.metaRow}>
        {fieldErrors.content ? (
          <AppText variant="caption" style={styles.error} accessibilityRole="alert">
            {fieldErrors.content}
          </AppText>
        ) : (
          <View style={styles.progressTrack} accessibilityElementsHidden>
            <View
              style={[
                styles.progressFill,
                { width: `${fillRatio * 100}%` },
                isNearLimit && styles.progressFillWarning,
              ]}
            />
          </View>
        )}
        <AppText
          variant="caption"
          style={[styles.counter, isNearLimit && styles.counterWarning]}
          accessibilityLabel={`${contentLength} of ${MAX_REVIEW_CONTENT_LENGTH} characters`}
        >
          {contentLength}/{MAX_REVIEW_CONTENT_LENGTH}
        </AppText>
      </View>

      <View style={styles.actions}>
        <AppButton
          title={submitLabel}
          loading={isSubmitting}
          disabled={isSubmitting || !hasContent}
          onPress={handleSubmit}
          style={styles.submitButton}
        />
      </View>
    </View>
  );
}

export function ReviewComposer(props: ReviewComposerProps) {
  return <ReviewComposerInner key={props.initialContent ?? 'new'} {...props} />;
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    marginHorizontal: layout.screenPaddingHorizontal,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerTitle: {
    flex: 1,
    color: colors.textPrimary,
    letterSpacing: 0.15,
  },
  closeButton: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputFrame: {
    borderRadius: borderRadius.md,
    backgroundColor: colors.inputBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  inputFrameFocused: {
    borderColor: colors.accentTint18,
    backgroundColor: colors.surface,
  },
  inputFrameError: {
    borderColor: colors.error,
  },
  input: {
    minHeight: 120,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.bodySmall.fontSize,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 16,
  },
  progressTrack: {
    flex: 1,
    height: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadius.full,
    backgroundColor: colors.textMuted,
  },
  progressFillWarning: {
    backgroundColor: colors.warning,
  },
  counter: {
    color: colors.textMuted,
    minWidth: 52,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  counterWarning: {
    color: colors.warning,
  },
  error: {
    color: colors.error,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  submitButton: {
    minHeight: 40,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
