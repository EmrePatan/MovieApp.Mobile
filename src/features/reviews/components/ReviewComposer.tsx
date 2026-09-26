import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
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
  toolbarTitle?: string;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  autoFocus?: boolean;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

const NEAR_LIMIT_RATIO = 0.9;

interface ComposerMutedButtonProps {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  testID?: string;
  tone?: 'neutral' | 'accent' | 'destructive';
}

function ComposerMutedButton({
  label,
  accessibilityLabel,
  onPress,
  disabled = false,
  loading = false,
  testID,
  tone = 'neutral',
}: ComposerMutedButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      hitSlop={6}
      onPress={onPress}
      testID={testID}
      style={({ pressed }) => [
        styles.mutedButton,
        tone === 'accent' && styles.mutedButtonAccent,
        tone === 'destructive' && styles.mutedButtonDestructive,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.mutedButtonDisabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={tone === 'accent' ? colors.accentStrong : colors.textMuted}
          size="small"
        />
      ) : (
        <AppText
          variant="caption"
          style={[
            styles.mutedButtonLabel,
            tone === 'accent' && styles.mutedButtonLabelAccent,
            tone === 'destructive' && styles.mutedButtonLabelDestructive,
          ]}
        >
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

function ReviewComposerInner({
  initialContent = '',
  contentTitle,
  toolbarTitle,
  submitLabel,
  isSubmitting = false,
  errorMessage = null,
  autoFocus = false,
  onSubmit,
  onCancel,
  onDelete,
  isDeleting = false,
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
          <ComposerMutedButton
            label={t('common.cancel')}
            accessibilityLabel={t('common.cancel')}
            disabled={isSubmitting}
            onPress={handleClose}
          />
        ) : (
          <View style={styles.toolbarSpacer} />
        )}

        <View style={styles.toolbarMeta}>
          <AppText variant="bodySmall" numberOfLines={1} style={styles.toolbarTitle}>
            {toolbarTitle ?? contentTitle ?? t('reviews.writeReviewTitle')}
          </AppText>
        </View>

        <ComposerMutedButton
          label={submitLabel}
          accessibilityLabel={submitLabel}
          tone="accent"
          loading={isSubmitting}
          disabled={isSubmitting || !hasContent}
          onPress={handleSubmit}
        />
      </View>

      <FeedbackMessage message={errorMessage} tone="error" onDismiss={undefined} />

      <View style={styles.inputShell}>
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
      </View>

      {fieldErrors.content ? (
        <AppText variant="caption" style={styles.error} accessibilityRole="alert">
          {fieldErrors.content}
        </AppText>
      ) : null}

      <View style={styles.metaRow}>
        <View style={styles.metaRowSide} />
        <View style={styles.metaRowCenter}>
          {onDelete ? (
            <ComposerMutedButton
              label={t('common.deleteReview')}
              accessibilityLabel={t('common.deleteReview')}
              disabled={isSubmitting}
              loading={isDeleting}
              onPress={onDelete}
              testID="review-composer-delete"
              tone="destructive"
            />
          ) : null}
        </View>
        <View style={styles.metaRowSide}>
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
    </View>
  );
}

export function ReviewComposer(props: ReviewComposerProps) {
  return <ReviewComposerInner key={props.initialContent ?? 'new'} {...props} />;
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingBottom: spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.borderSubtle,
  },
  toolbarSpacer: {
    width: 72,
  },
  mutedButton: {
    minHeight: 36,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: colors.inputBackground,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mutedButtonAccent: {
    backgroundColor: colors.accentTint18,
    borderColor: colors.borderAccent,
  },
  mutedButtonDestructive: {
    backgroundColor: 'rgba(200, 90, 75, 0.14)',
    borderColor: 'rgba(196, 140, 100, 0.38)',
  },
  mutedButtonDisabled: {
    opacity: interaction.disabledOpacity,
  },
  mutedButtonLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.15,
  },
  mutedButtonLabelAccent: {
    color: colors.accentStrong,
  },
  mutedButtonLabelDestructive: {
    color: '#D9A192',
  },
  toolbarMeta: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  toolbarTitle: {
    textAlign: 'center',
    fontWeight: '600',
    color: colors.textSecondary,
  },
  inputShell: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  input: {
    minHeight: 112,
    maxHeight: 176,
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
    minHeight: 36,
  },
  metaRowSide: {
    flex: 1,
    justifyContent: 'center',
  },
  metaRowCenter: {
    flexShrink: 0,
    alignItems: 'center',
  },
  counter: {
    color: colors.textMuted,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
    alignSelf: 'flex-end',
  },
  counterWarning: {
    color: colors.warning,
  },
  error: {
    color: colors.error,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
