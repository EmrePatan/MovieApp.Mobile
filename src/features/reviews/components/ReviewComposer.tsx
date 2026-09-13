import { useEffect, useRef, useState } from 'react';
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

export function ReviewComposer({
  initialContent = '',
  submitLabel,
  isSubmitting = false,
  errorMessage = null,
  autoFocus = false,
  onSubmit,
  onCancel,
}: ReviewComposerProps) {
  const inputRef = useRef<TextInput>(null);
  const [content, setContent] = useState(initialContent);
  const [fieldErrors, setFieldErrors] = useState<ReviewFormErrors>({});
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (initialContent !== content && initialContent.length > 0 && content === '') {
      setContent(initialContent);
    }
  }, [content, initialContent]);

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
        <View style={styles.headerIcon}>
          <Ionicons name="create-outline" size={16} color={colors.accent} />
        </View>
        <View style={styles.headerCopy}>
          <AppText variant="bodySmall" style={styles.headerTitle}>
            Your thoughts
          </AppText>
          <AppText variant="caption" muted>
            Honest takes welcome — emoji too.
          </AppText>
        </View>
        {onCancel ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close composer"
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
          accessibilityLabel="Review"
          multiline
          value={content}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="What stood out? A scene, a performance, a mood..."
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

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentTint12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  headerTitle: {
    color: colors.textPrimary,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  closeButton: {
    width: 32,
    height: 32,
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
    paddingTop: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
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
