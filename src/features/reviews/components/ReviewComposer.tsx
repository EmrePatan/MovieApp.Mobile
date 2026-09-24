import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
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
  contentTitle?: string;
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
  contentTitle,
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
    }, 120);

    return () => {
      clearTimeout(focusTimer);
    };
  }, [autoFocus]);

  const contentLength = getReviewContentLength(content);
  const isNearLimit = contentLength >= MAX_REVIEW_CONTENT_LENGTH * NEAR_LIMIT_RATIO;
  const hasContent = contentLength > 0;

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
      <View style={styles.toolbar}>
        {onCancel ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
            disabled={isSubmitting}
            hitSlop={8}
            onPress={handleClose}
            style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
          >
            <AppText variant="bodySmall" style={styles.cancelLabel}>
              {t('common.cancel')}
            </AppText>
          </Pressable>
        ) : (
          <View style={styles.toolbarSpacer} />
        )}

        <View style={styles.toolbarMeta}>
          {contentTitle ? (
            <AppText variant="caption" muted numberOfLines={1} style={styles.contentTitle}>
              {contentTitle}
            </AppText>
          ) : (
            <AppText variant="caption" muted style={styles.contentTitle}>
              {t('reviews.writeReviewTitle')}
            </AppText>
          )}
        </View>

        <AppButton
          title={submitLabel}
          loading={isSubmitting}
          disabled={isSubmitting || !hasContent}
          onPress={handleSubmit}
          style={styles.submitButton}
          accessibilityLabel={submitLabel}
        />
      </View>

      <FeedbackMessage message={errorMessage} tone="error" onDismiss={undefined} />

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
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          fieldErrors.content && styles.inputError,
        ]}
        textAlignVertical="top"
      />

      <View style={styles.metaRow}>
        {fieldErrors.content ? (
          <AppText variant="caption" style={styles.error} accessibilityRole="alert">
            {fieldErrors.content}
          </AppText>
        ) : (
          <View style={styles.metaSpacer} />
        )}
        <AppText
          variant="caption"
          style={[styles.counter, isNearLimit && styles.counterWarning]}
          accessibilityLabel={t('reviews.characterCountAccessibility', {
            current: contentLength,
            max: MAX_REVIEW_CONTENT_LENGTH,
          })}
        >
          {contentLength}/{MAX_REVIEW_CONTENT_LENGTH}
        </AppText>
      </View>
    </View>
  );
}

export function ReviewComposer(props: ReviewComposerProps) {
  return <ReviewComposerInner key={props.initialContent ?? 'new'} {...props} />;
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 40,
  },
  toolbarSpacer: {
    width: 64,
  },
  cancelButton: {
    minWidth: 64,
    minHeight: 40,
    justifyContent: 'center',
  },
  cancelLabel: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  toolbarMeta: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  contentTitle: {
    textAlign: 'center',
  },
  submitButton: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  input: {
    minHeight: 96,
    maxHeight: 160,
    color: colors.textPrimary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.body.fontSize,
    lineHeight: 24,
    letterSpacing: 0.1,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.inputBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  inputFocused: {
    borderColor: colors.borderAccent,
    backgroundColor: colors.surface,
  },
  inputError: {
    borderColor: colors.error,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 16,
  },
  metaSpacer: {
    flex: 1,
  },
  counter: {
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
  },
  counterWarning: {
    color: colors.warning,
  },
  error: {
    color: colors.error,
    flex: 1,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
