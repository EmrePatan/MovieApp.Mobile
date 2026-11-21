import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Keyboard, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { FeedbackMessage } from '@/components/feedback/FeedbackMessage';
import { SocialGifFrame } from '@/features/social/components/SocialGifFrame';
import { SocialCommentPosterFrame } from '@/features/social/components/SocialCommentPosterFrame';
import { SocialGifPickerSheet } from '@/features/social/components/SocialGifPickerSheet';
import { SocialCatalogImagePickerSheet } from '@/features/social/components/SocialCatalogImagePickerSheet';
import {
  buildSocialCommentBody,
  parseSocialCommentContent,
  type SocialCommentMediaDraft,
} from '@/features/social/utils/social-comment-media';
import type { GalleryResponse } from '@/features/gallery/types';
import { MAX_REVIEW_CONTENT_LENGTH } from '../types';
import { getReviewContentLength } from '../utils/review-content-length';
import {
  hasReviewValidationErrors,
  validateReviewContent,
  type ReviewFormErrors,
} from '../utils/review-validation';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { premiumSheet } from '@/theme/premium-sheet';
import { typography } from '@/theme/typography';

const sheet = premiumSheet;

interface ReviewComposerProps {
  initialContent?: string;
  toolbarTitle?: string;
  submitLabel: string;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  autoFocus?: boolean;
  /** Catalog gallery for photo attach (posters + backdrops). */
  gallery?: GalleryResponse | null;
  galleryLoading?: boolean;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
}

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
          color={tone === 'accent' ? sheet.mutedGold : sheet.textSecondary}
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

function seedFromContent(initialContent: string): {
  text: string;
  media: SocialCommentMediaDraft | null;
} {
  const parsed = parseSocialCommentContent(initialContent);
  if (parsed.mediaKind === 'gif' && parsed.gifUrl) {
    return { text: parsed.text, media: { kind: 'gif', value: parsed.gifUrl } };
  }
  if (parsed.mediaKind === 'image' && parsed.posterPath) {
    return { text: parsed.text, media: { kind: 'image', value: parsed.posterPath } };
  }
  return { text: initialContent, media: null };
}

const NEAR_LIMIT_RATIO = 0.9;

function ReviewComposerInner({
  initialContent = '',
  toolbarTitle,
  submitLabel,
  isSubmitting = false,
  errorMessage = null,
  autoFocus = false,
  gallery = null,
  galleryLoading = false,
  onSubmit,
  onCancel,
  onDelete,
  isDeleting = false,
}: ReviewComposerProps) {
  const { t } = useTranslation();
  const inputRef = useRef<TextInput>(null);
  const seeded = useMemo(() => seedFromContent(initialContent), [initialContent]);
  const [content, setContent] = useState(seeded.text);
  const [draftMedia, setDraftMedia] = useState<SocialCommentMediaDraft | null>(seeded.media);
  const [gifPickerOpen, setGifPickerOpen] = useState(false);
  const [photoPickerOpen, setPhotoPickerOpen] = useState(false);
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
  const hasContent = contentLength > 0 || draftMedia !== null;
  const gifSelected = draftMedia?.kind === 'gif';
  const photoSelected = draftMedia?.kind === 'image';
  const canAttachPhoto = Boolean(gallery) || galleryLoading;

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
    const body = buildSocialCommentBody(content, draftMedia);
    const errors = validateReviewContent(body);
    setFieldErrors(errors);

    if (hasReviewValidationErrors(errors)) {
      return;
    }

    onSubmit(body);
  };

  const handleClose = () => {
    inputRef.current?.blur();
    Keyboard.dismiss();
    onCancel?.();
  };

  return (
    <View style={styles.container} testID="review-composer">
      <View style={styles.handle} />

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
            {toolbarTitle ?? t('reviews.writeReviewTitle')}
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

      {draftMedia?.kind === 'gif' ? (
        <View style={styles.preview}>
          <SocialGifFrame uri={draftMedia.value} size="preview" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('social.removeGif')}
            onPress={() => setDraftMedia(null)}
            style={styles.removeMedia}
            hitSlop={8}
          >
            <Ionicons name="close" size={16} color={sheet.textPrimary} />
          </Pressable>
        </View>
      ) : null}
      {draftMedia?.kind === 'image' ? (
        <View style={styles.preview}>
          <SocialCommentPosterFrame path={draftMedia.value} size="preview" />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('social.removePoster')}
            onPress={() => setDraftMedia(null)}
            style={styles.removeMedia}
            hitSlop={8}
          >
            <Ionicons name="close" size={16} color={sheet.textPrimary} />
          </Pressable>
        </View>
      ) : null}

      <View style={[styles.inputShell, isFocused && styles.inputShellFocused, fieldErrors.content && styles.inputShellError]}>
        <TextInput
          ref={inputRef}
          accessibilityLabel={t('reviews.reviewFieldLabel')}
          multiline
          value={content}
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={t('reviews.placeholder')}
          placeholderTextColor={sheet.textSecondary}
          autoCorrect
          style={styles.input}
          textAlignVertical="top"
        />
        <View style={styles.mediaTools}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('social.addGif')}
            accessibilityState={{ selected: gifSelected, disabled: photoSelected }}
            disabled={photoSelected || isSubmitting}
            onPress={() => setGifPickerOpen(true)}
            style={({ pressed }) => [
              styles.mediaChip,
              gifSelected && styles.mediaChipActive,
              photoSelected && styles.mediaChipDisabled,
              pressed && !photoSelected && styles.pressed,
            ]}
          >
            <AppText
              variant="caption"
              style={[
                styles.mediaChipLabel,
                gifSelected && styles.mediaChipLabelActive,
                photoSelected && styles.mediaChipLabelDisabled,
              ]}
            >
              GIF
            </AppText>
          </Pressable>
          {canAttachPhoto ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('social.addPoster')}
              accessibilityState={{ selected: photoSelected, disabled: gifSelected }}
              disabled={gifSelected || isSubmitting}
              onPress={() => setPhotoPickerOpen(true)}
              style={({ pressed }) => [
                styles.mediaChip,
                photoSelected && styles.mediaChipActive,
                gifSelected && styles.mediaChipDisabled,
                pressed && !gifSelected && styles.pressed,
              ]}
            >
              <Ionicons
                name="images-outline"
                size={16}
                color={
                  gifSelected
                    ? sheet.textSecondary
                    : photoSelected
                      ? sheet.mutedGold
                      : sheet.textPrimary
                }
              />
              <AppText
                variant="caption"
                style={[
                  styles.mediaChipLabel,
                  photoSelected && styles.mediaChipLabelActive,
                  gifSelected && styles.mediaChipLabelDisabled,
                ]}
              >
                {t('social.posterChip')}
              </AppText>
            </Pressable>
          ) : null}
        </View>
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

      <SocialGifPickerSheet
        visible={gifPickerOpen}
        onClose={() => setGifPickerOpen(false)}
        onSelect={(gifUrl) => setDraftMedia({ kind: 'gif', value: gifUrl })}
      />
      <SocialCatalogImagePickerSheet
        visible={photoPickerOpen}
        gallery={gallery}
        isLoading={galleryLoading}
        onClose={() => setPhotoPickerOpen(false)}
        onSelect={(filePath) => setDraftMedia({ kind: 'image', value: filePath })}
      />
    </View>
  );
}

export function ReviewComposer(props: ReviewComposerProps) {
  return <ReviewComposerInner key={props.initialContent ?? 'new'} {...props} />;
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
    backgroundColor: sheet.background,
  },
  handle: {
    alignSelf: 'center',
    width: 64,
    height: 5,
    borderRadius: 999,
    backgroundColor: sheet.handle,
    marginBottom: 4,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 40,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: sheet.border,
  },
  toolbarSpacer: {
    width: 72,
  },
  mutedButton: {
    minHeight: 34,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: sheet.secondary,
    borderWidth: 1,
    borderColor: '#28262C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mutedButtonAccent: {
    backgroundColor: 'rgba(210, 164, 81, 0.14)',
    borderColor: sheet.goldBorder,
  },
  mutedButtonDestructive: {
    backgroundColor: 'rgba(200, 90, 75, 0.12)',
    borderColor: 'rgba(196, 140, 100, 0.35)',
  },
  mutedButtonDisabled: {
    opacity: interaction.disabledOpacity,
  },
  mutedButtonLabel: {
    color: sheet.textSecondary,
    fontWeight: '600',
    fontSize: 13,
    letterSpacing: 0.15,
  },
  mutedButtonLabelAccent: {
    color: sheet.mutedGold,
  },
  mutedButtonLabelDestructive: {
    color: colors.danger,
  },
  toolbarMeta: {
    flex: 1,
    minWidth: 0,
    alignItems: 'center',
  },
  toolbarTitle: {
    color: sheet.textPrimary,
    fontWeight: '700',
    fontSize: 15,
  },
  preview: {
    alignSelf: 'flex-start',
  },
  removeMedia: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(10,10,15,0.72)',
  },
  inputShell: {
    borderRadius: 18,
    backgroundColor: sheet.elevated,
    borderWidth: 1,
    borderColor: sheet.border,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 10,
  },
  inputShellFocused: {
    borderColor: sheet.goldBorder,
  },
  inputShellError: {
    borderColor: colors.danger,
  },
  input: {
    minHeight: 96,
    maxHeight: 180,
    color: sheet.textPrimary,
    fontSize: typography.body.fontSize,
    lineHeight: typography.body.lineHeight,
    padding: 0,
  },
  mediaTools: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mediaChip: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
    borderWidth: 1,
    borderColor: '#28262C',
    backgroundColor: sheet.secondary,
  },
  mediaChipActive: {
    borderColor: sheet.goldBorder,
    backgroundColor: 'rgba(210, 164, 81, 0.14)',
  },
  mediaChipDisabled: {
    borderColor: '#28262C',
    backgroundColor: sheet.secondary,
    opacity: 0.55,
  },
  mediaChipLabel: {
    color: sheet.textPrimary,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  mediaChipLabelActive: {
    color: sheet.mutedGold,
  },
  mediaChipLabelDisabled: {
    color: sheet.textSecondary,
  },
  error: {
    color: colors.danger,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 34,
  },
  metaRowSide: {
    flex: 1,
    alignItems: 'flex-end',
  },
  metaRowCenter: {
    alignItems: 'center',
  },
  counter: {
    color: sheet.textSecondary,
  },
  counterWarning: {
    color: colors.warning,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
