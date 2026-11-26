import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { AppBottomSheet } from '@/components/layout/AppBottomSheet';
import { useMovieGallery, useTvShowGallery } from '@/features/gallery/hooks/useGallery';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { StarRatingSelector } from '@/features/ratings/components/StarRatingSelector';
import { useRateContent } from '@/features/ratings/hooks/useRatingMutations';
import { useMyRating } from '@/features/ratings/hooks/useRatings';
import {
  backendScoreToStarRating,
  starRatingToBackendScore,
} from '@/features/ratings/utils/star-rating';
import { useMyReview } from '@/features/reviews/hooks/useMyReview';
import {
  useCreateReviewMutation,
  useUpdateReviewMutation,
} from '@/features/reviews/hooks/useReviewMutations';
import { MAX_REVIEW_CONTENT_LENGTH } from '@/features/reviews/types';
import { useSearchResults } from '@/features/search/hooks/useSearch';
import { isPersonSearchResult, type CatalogSearchResultItem } from '@/features/search/types';
import { MIN_SEARCH_QUERY_LENGTH } from '@/features/search/types';
import { SocialCatalogImagePickerSheet } from './SocialCatalogImagePickerSheet';
import { SocialCommentPosterFrame } from './SocialCommentPosterFrame';
import { SocialGifFrame } from './SocialGifFrame';
import { SocialGifPickerSheet } from './SocialGifPickerSheet';
import {
  buildSocialCommentBody,
  parseSocialCommentContent,
  type SocialCommentMediaDraft,
} from '../utils/social-comment-media';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';
import { socialFeedTheme } from './social-feed-theme';

interface SocialFeedQuickPostSheetProps {
  visible: boolean;
  onClose: () => void;
}

const SEARCH_DEBOUNCE_MS = 300;

function useDebouncedValue(value: string, delay: number): string {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}

/**
 * In-feed "what did you watch?" flow: find a title, rate it, add a thought, share.
 * Replaces the jump to the search screen so the user never leaves the feed.
 */
export function SocialFeedQuickPostSheet({ visible, onClose }: SocialFeedQuickPostSheetProps) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CatalogSearchResultItem | null>(null);
  const [stars, setStars] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [media, setMedia] = useState<SocialCommentMediaDraft | null>(null);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [gifOpen, setGifOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedQuery = useDebouncedValue(query.trim(), SEARCH_DEBOUNCE_MS);
  const search = useSearchResults(selected ? '' : debouncedQuery, 'all');
  const results = useMemo(
    () =>
      (search.data?.pages.flatMap((page) => page.items) ?? []).filter(
        (item): item is CatalogSearchResultItem => !isPersonSearchResult(item),
      ),
    [search.data?.pages],
  );

  const contentType = selected?.type === 'tv' ? 'tv' : 'movie';
  const selectedId = selected?.id ?? '';
  const rate = useRateContent(contentType, selectedId);
  const createReview = useCreateReviewMutation(contentType, selectedId);
  const updateReview = useUpdateReviewMutation(contentType, selectedId);
  const myRating = useMyRating(contentType, selectedId);
  const myReview = useMyReview(contentType, selectedId);
  const existingReview = myReview.data ?? null;
  const existingScore = myRating.data?.score ?? null;
  const isLoadingExisting = Boolean(selected) && (myRating.isLoading || myReview.isLoading);

  // Prefill the user's existing rating and review once per picked title. Without this the form
  // always opened empty, and sharing a thought on an already-reviewed title hit the backend's
  // one-review-per-title rule (409) instead of editing it.
  // Adjusted during render (React's "reset state when a prop changes" pattern), not in an effect.
  const [prefilledFor, setPrefilledFor] = useState<string | null>(null);
  if (selected && !isLoadingExisting && prefilledFor !== selected.id) {
    setPrefilledFor(selected.id);
    setStars(existingScore != null ? backendScoreToStarRating(existingScore) : null);
    if (existingReview) {
      const parsed = parseSocialCommentContent(existingReview.content);
      setText(parsed.text);
      setIsSpoiler(parsed.spoiler);
      setMedia(
        parsed.gifUrl
          ? { kind: 'gif', value: parsed.gifUrl }
          : parsed.posterPath
            ? { kind: 'image', value: parsed.posterPath }
            : null,
      );
    } else {
      setText('');
      setIsSpoiler(false);
      setMedia(null);
    }
  }

  // Gallery hooks only fire for a valid id, so the unused kind stays idle.
  const movieGallery = useMovieGallery(contentType === 'movie' ? (selected?.id ?? '') : '');
  const tvGallery = useTvShowGallery(contentType === 'tv' ? (selected?.id ?? '') : '');
  const galleryQuery = contentType === 'tv' ? tvGallery : movieGallery;

  const reset = useCallback(() => {
    setMedia(null);
    setIsSpoiler(false);
    setQuery('');
    setSelected(null);
    setPrefilledFor(null);
    setStars(null);
    setText('');
    setError(null);
    setIsSubmitting(false);
  }, []);

  const handleClose = useCallback(() => {
    reset();
    onClose();
  }, [onClose, reset]);

  const canShare =
    Boolean(selected) &&
    !isLoadingExisting &&
    (stars != null || text.trim().length > 0 || media != null) &&
    !isSubmitting;

  const handleShare = useCallback(async () => {
    if (!selected || !canShare) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      if (stars != null) {
        const score = starRatingToBackendScore(stars);
        if (score !== existingScore) {
          await rate.mutateAsync(score);
        }
      }
      const body = buildSocialCommentBody(text, media, isSpoiler);
      if (text.trim() || media) {
        if (existingReview) {
          if (body !== existingReview.content) {
            await updateReview.mutateAsync({ content: body });
          }
        } else {
          await createReview.mutateAsync({ content: body });
        }
      }
      handleClose();
    } catch {
      setError(t('social.composerError'));
      setIsSubmitting(false);
    }
  }, [
    canShare,
    createReview,
    existingReview,
    existingScore,
    handleClose,
    isSpoiler,
    media,
    rate,
    selected,
    stars,
    t,
    text,
    updateReview,
  ]);

  const showResults = !selected && debouncedQuery.length >= MIN_SEARCH_QUERY_LENGTH;

  return (
    <AppBottomSheet
      visible={visible}
      onClose={handleClose}
      title={t('social.composerPrompt')}
      avoidKeyboard
      testID="social-feed-quick-post-sheet"
    >
      <GestureHandlerRootView style={styles.root}>
        <View style={styles.body}>
          {selected ? (
            <View style={styles.selected}>
              <View style={styles.selectedRow}>
                <View style={styles.poster}>
                  <CatalogImage
                    path={selected.posterUrl}
                    width={52}
                    height={78}
                    accessibilityLabel={selected.title}
                    rounded={false}
                  />
                </View>
                <View style={styles.selectedCopy}>
                  <AppText style={styles.selectedTitle} numberOfLines={2}>
                    {selected.title}
                  </AppText>
                  {selected.year ? (
                    <AppText style={styles.meta}>{selected.year}</AppText>
                  ) : null}
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('social.composerChange')}
                  onPress={() => setSelected(null)}
                  hitSlop={8}
                >
                  <AppText style={styles.change}>{t('social.composerChange')}</AppText>
                </Pressable>
              </View>

              <View style={styles.stars}>
                <StarRatingSelector
                  value={stars}
                  onCommit={setStars}
                  onClear={() => setStars(null)}
                />
              </View>

              <TextInput
                value={text}
                onChangeText={setText}
                placeholder={t('social.composerThoughts')}
                placeholderTextColor={socialFeedTheme.placeholder}
                multiline
                maxLength={MAX_REVIEW_CONTENT_LENGTH}
                style={styles.input}
                textAlignVertical="top"
                accessibilityLabel={t('social.composerThoughts')}
              />

              {media?.kind === 'gif' ? (
                <View style={styles.preview}>
                  <SocialGifFrame uri={media.value} size="preview" />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('social.removeGif')}
                    onPress={() => setMedia(null)}
                    style={styles.removeMedia}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={16} color={socialFeedTheme.textPrimary} />
                  </Pressable>
                </View>
              ) : null}
              {media?.kind === 'image' ? (
                <View style={styles.preview}>
                  <SocialCommentPosterFrame path={media.value} size="preview" />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('social.removePoster')}
                    onPress={() => setMedia(null)}
                    style={styles.removeMedia}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={16} color={socialFeedTheme.textPrimary} />
                  </Pressable>
                </View>
              ) : null}

              <View style={styles.mediaTools}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('social.addGif')}
                  disabled={media?.kind === 'image'}
                  onPress={() => setGifOpen(true)}
                  style={({ pressed }) => [
                    styles.mediaChip,
                    media?.kind === 'gif' && styles.mediaChipActive,
                    media?.kind === 'image' && styles.mediaChipDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <AppText style={styles.mediaChipLabel}>GIF</AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('social.addPoster')}
                  disabled={media?.kind === 'gif'}
                  onPress={() => setPhotoOpen(true)}
                  style={({ pressed }) => [
                    styles.mediaChip,
                    media?.kind === 'image' && styles.mediaChipActive,
                    media?.kind === 'gif' && styles.mediaChipDisabled,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons name="images-outline" size={16} color={socialFeedTheme.textPrimary} />
                  <AppText style={styles.mediaChipLabel}>{t('social.posterChip')}</AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="switch"
                  accessibilityLabel={t('reviews.spoilerChip')}
                  accessibilityState={{ checked: isSpoiler }}
                  onPress={() => setIsSpoiler((current) => !current)}
                  testID="quick-post-spoiler"
                  style={({ pressed }) => [
                    styles.mediaChip,
                    isSpoiler && styles.mediaChipActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Ionicons
                    name={isSpoiler ? 'eye-off' : 'eye-off-outline'}
                    size={16}
                    color={isSpoiler ? socialFeedTheme.accent : socialFeedTheme.textPrimary}
                  />
                  <AppText style={styles.mediaChipLabel}>{t('reviews.spoilerChip')}</AppText>
                </Pressable>
              </View>

              {error ? <AppText style={styles.error}>{error}</AppText> : null}

              <AppButton
                title={t('social.composerShare')}
                onPress={() => void handleShare()}
                loading={isSubmitting}
                disabled={!canShare}
              />
            </View>
          ) : (
            <View style={styles.searchBlock}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={18} color={socialFeedTheme.textMuted} />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder={t('social.composerSearchPlaceholder')}
                  placeholderTextColor={socialFeedTheme.placeholder}
                  style={styles.searchInput}
                  autoFocus
                  autoCorrect={false}
                  returnKeyType="search"
                  accessibilityLabel={t('social.composerSearchPlaceholder')}
                />
              </View>

              {showResults ? (
                search.isLoading ? (
                  <ActivityIndicator color={socialFeedTheme.accent} style={styles.loader} />
                ) : (
                  <FlatList
                    data={results}
                    keyExtractor={(item) => `${item.type}-${item.id}`}
                    // Same first-tap-only-dismisses-keyboard issue as the DNA cover sheet.
                    keyboardShouldPersistTaps="always"
                    style={styles.results}
                    ListEmptyComponent={
                      <AppText style={styles.empty}>{t('social.noSearchResults')}</AppText>
                    }
                    renderItem={({ item }) => (
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={item.title}
                        onPress={() => {
                          Keyboard.dismiss();
                          setSelected(item);
                        }}
                        style={({ pressed }) => [styles.resultRow, pressed && styles.pressed]}
                      >
                        <View style={styles.resultPoster}>
                          <CatalogImage
                            path={item.posterUrl}
                            width={40}
                            height={60}
                            accessibilityLabel={item.title}
                            rounded={false}
                          />
                        </View>
                        <View style={styles.selectedCopy}>
                          <AppText style={styles.resultTitle} numberOfLines={2}>
                            {item.title}
                          </AppText>
                          <AppText style={styles.meta}>
                            {[item.type === 'tv' ? t('common.tv') : t('social.movies'), item.year]
                              .filter(Boolean)
                              .join(' · ')}
                          </AppText>
                        </View>
                      </Pressable>
                    )}
                  />
                )
              ) : (
                <AppText style={styles.hint}>{t('social.composerHint')}</AppText>
              )}
            </View>
          )}
        </View>
      </GestureHandlerRootView>
      <SocialGifPickerSheet
        visible={gifOpen}
        onClose={() => setGifOpen(false)}
        onSelect={(gifUrl) => setMedia({ kind: 'gif', value: gifUrl })}
      />
      <SocialCatalogImagePickerSheet
        visible={photoOpen}
        gallery={galleryQuery.data ?? null}
        isLoading={galleryQuery.isLoading}
        onClose={() => setPhotoOpen(false)}
        onSelect={(filePath) => setMedia({ kind: 'image', value: filePath })}
      />
    </AppBottomSheet>
  );
}

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  body: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  searchBlock: {
    gap: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 48,
    paddingHorizontal: spacing.md,
    borderRadius: 24,
    backgroundColor: glass.panelInput,
    borderWidth: 1,
    borderColor: glass.hairline,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: socialFeedTheme.textPrimary,
  },
  results: {
    maxHeight: 240,
  },
  loader: {
    paddingVertical: spacing.xl,
  },
  empty: {
    textAlign: 'center',
    paddingVertical: spacing.xl,
    color: socialFeedTheme.textSecondary,
  },
  hint: {
    textAlign: 'center',
    paddingVertical: spacing.xl,
    color: socialFeedTheme.textMuted,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  resultPoster: {
    width: 40,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: socialFeedTheme.surfaceSecondary,
  },
  resultTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
    color: socialFeedTheme.textPrimary,
  },
  meta: {
    fontSize: 12,
    lineHeight: 16,
    color: socialFeedTheme.textMuted,
  },
  selected: {
    gap: spacing.md,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  poster: {
    width: 52,
    height: 78,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: socialFeedTheme.surfaceSecondary,
  },
  selectedCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  selectedTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
    color: socialFeedTheme.textPrimary,
  },
  change: {
    fontSize: 13,
    fontWeight: '600',
    color: socialFeedTheme.accent,
  },
  stars: {
    alignItems: 'center',
  },
  input: {
    minHeight: 96,
    maxHeight: 180,
    padding: spacing.md,
    borderRadius: 20,
    fontSize: 15,
    lineHeight: 22,
    color: socialFeedTheme.textPrimary,
    backgroundColor: glass.panelInput,
    borderWidth: 1,
    borderColor: glass.hairline,
  },
  preview: {
    alignItems: 'center',
  },
  removeMedia: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  mediaTools: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mediaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    height: 34,
    paddingHorizontal: spacing.md,
    borderRadius: 17,
    backgroundColor: glass.panelInput,
    borderWidth: 1,
    borderColor: glass.hairline,
  },
  mediaChipActive: {
    borderColor: socialFeedTheme.accent,
  },
  mediaChipDisabled: {
    opacity: 0.4,
  },
  mediaChipLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: socialFeedTheme.textPrimary,
  },
  error: {
    fontSize: 13,
    color: '#E5484D',
  },
  pressed: {
    opacity: 0.85,
  },
});
