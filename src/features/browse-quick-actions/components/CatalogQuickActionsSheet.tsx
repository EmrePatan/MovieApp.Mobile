import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { PosterImage } from '@/components/common/PosterImage';
import {
  formatCatalogYear,
  formatContentType,
  formatRating,
} from '@/utils/format';
import { interaction } from '@/theme/interaction';
import { premiumSheet, premiumSheetChrome } from '@/theme/premium-sheet';
import type { BrowseQuickActionsTarget } from '../types';

const sheet = premiumSheet;

interface CatalogQuickActionsSheetProps {
  visible: boolean;
  target: BrowseQuickActionsTarget | null;
  isWatched: boolean;
  isFavorited: boolean;
  watchedBusy?: boolean;
  favoriteBusy?: boolean;
  onClose: () => void;
  onToggleWatched: () => void;
  onToggleFavorite: () => void;
  onOpenWatchlists: () => void;
}

export function CatalogQuickActionsSheet({
  visible,
  target,
  isWatched,
  isFavorited,
  watchedBusy = false,
  favoriteBusy = false,
  onClose,
  onToggleWatched,
  onToggleFavorite,
  onOpenWatchlists,
}: CatalogQuickActionsSheetProps) {
  const { t } = useTranslation();
  const { height: windowHeight } = useWindowDimensions();
  const maxBodyHeight = Math.max(280, windowHeight * 0.72);

  const yearLabel = target
    ? formatCatalogYear(target.releaseDate ?? null, target.year ?? null)
    : null;
  const voteAverage = target?.voteAverage ?? 0;
  const showRating = voteAverage > 0;
  const watchedTitle = isWatched ? t('common.markAsUnwatched') : t('common.markAsWatched');
  const favoriteLabel = t('common.favorite');
  const listLabel = t('browseQuickActions.addToList');

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {visible && target ? (
        <View style={styles.overlay} testID="catalog-quick-actions-sheet">
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('common.cancel')}
            style={styles.backdrop}
            onPress={onClose}
          />
          <SafeAreaView style={styles.sheet} edges={['bottom']}>
            <View style={styles.handle} />

            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: maxBodyHeight }}
              contentContainerStyle={styles.body}
            >
              <View style={styles.header}>
                <View style={styles.posterFrame}>
                  <PosterImage
                    uri={target.posterUrl}
                    width={112}
                    height={168}
                    accessibilityLabel={t('common.posterAccessibility', { title: target.title })}
                  />
                </View>
                <View style={styles.headerMeta}>
                  <AppText variant="title" numberOfLines={3} style={styles.title}>
                    {target.title}
                  </AppText>
                  <View style={styles.metadataRow}>
                    <AppText variant="body" style={styles.metadataText} numberOfLines={1}>
                      {formatContentType(target.contentType)}
                    </AppText>
                    {yearLabel ? (
                      <>
                        <AppText variant="body" style={styles.metadataDot}>
                          ·
                        </AppText>
                        <AppText variant="body" style={styles.metadataText} numberOfLines={1}>
                          {yearLabel}
                        </AppText>
                      </>
                    ) : null}
                  </View>
                  {showRating ? (
                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={13} color={sheet.mutedGold} />
                      <AppText variant="body" style={styles.ratingText} numberOfLines={1}>
                        {formatRating(voteAverage)}
                      </AppText>
                    </View>
                  ) : null}
                </View>
              </View>

              <View style={styles.divider} />

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={watchedTitle}
                accessibilityState={{ selected: isWatched, busy: watchedBusy }}
                disabled={watchedBusy}
                onPress={onToggleWatched}
                style={({ pressed }) => [
                  styles.watchedAction,
                  isWatched && styles.watchedActionSelected,
                  pressed && !watchedBusy && styles.pressed,
                  watchedBusy && styles.busy,
                ]}
                testID="quick-action-watched"
              >
                <View
                  style={[styles.watchedIconWell, isWatched && styles.watchedIconWellSelected]}
                >
                  {watchedBusy ? (
                    <ActivityIndicator
                      color={isWatched ? sheet.background : sheet.mutedGold}
                      size="small"
                    />
                  ) : (
                    <Ionicons
                      name={isWatched ? 'checkmark' : 'checkmark-outline'}
                      size={16}
                      color={isWatched ? sheet.background : sheet.textSecondary}
                    />
                  )}
                </View>
                <View style={styles.watchedText}>
                  <AppText variant="subtitle" numberOfLines={1} style={styles.watchedTitle}>
                    {watchedTitle}
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={16} color={sheet.textSecondary} />
              </Pressable>

              <View style={styles.secondaryRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={favoriteLabel}
                  accessibilityState={{ selected: isFavorited, busy: favoriteBusy }}
                  disabled={favoriteBusy}
                  onPress={onToggleFavorite}
                  style={({ pressed }) => [
                    styles.secondaryAction,
                    pressed && !favoriteBusy && styles.pressed,
                    favoriteBusy && styles.busy,
                  ]}
                  testID="quick-action-favorite"
                >
                  {favoriteBusy ? (
                    <ActivityIndicator
                      color={isFavorited ? sheet.mutedGold : sheet.textPrimary}
                      size="small"
                    />
                  ) : (
                    <Ionicons
                      name={isFavorited ? 'heart' : 'heart-outline'}
                      size={18}
                      color={isFavorited ? sheet.mutedGold : sheet.textPrimary}
                    />
                  )}
                  <AppText
                    variant="body"
                    numberOfLines={1}
                    style={[
                      styles.secondaryLabel,
                      isFavorited && styles.secondaryLabelActive,
                    ]}
                  >
                    {favoriteLabel}
                  </AppText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={listLabel}
                  onPress={onOpenWatchlists}
                  style={({ pressed }) => [
                    styles.secondaryAction,
                    pressed && styles.pressed,
                  ]}
                  testID="quick-action-watchlist"
                >
                  <Ionicons name="bookmark-outline" size={18} color={sheet.textPrimary} />
                  <AppText variant="body" numberOfLines={1} style={styles.secondaryLabel}>
                    {listLabel}
                  </AppText>
                </Pressable>
              </View>
            </ScrollView>
          </SafeAreaView>
        </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: premiumSheetChrome.overlay,
  backdrop: premiumSheetChrome.backdrop,
  sheet: premiumSheetChrome.sheet,
  handle: premiumSheetChrome.handle,
  body: {
    paddingTop: 18,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  posterFrame: {
    width: 112,
    height: 168,
    borderRadius: 18,
    overflow: 'hidden',
    flexShrink: 0,
  },
  headerMeta: {
    flex: 1,
    minWidth: 0,
    gap: 8,
    justifyContent: 'center',
  },
  title: {
    color: sheet.textPrimary,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 5,
  },
  metadataText: {
    color: sheet.textSecondary,
    fontSize: 14,
    lineHeight: 18,
    flexShrink: 1,
  },
  metadataDot: {
    color: sheet.textSecondary,
    fontSize: 14,
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    color: sheet.mutedGold,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  divider: {
    marginTop: 16,
    marginBottom: 18,
    height: 1,
    backgroundColor: sheet.border,
  },
  watchedAction: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#28262C',
    backgroundColor: sheet.elevated,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  watchedActionSelected: {
    borderColor: sheet.goldBorder,
  },
  watchedIconWell: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: sheet.iconSurface,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  watchedIconWellSelected: {
    backgroundColor: sheet.mutedGold,
  },
  watchedText: {
    flex: 1,
    minWidth: 0,
  },
  watchedTitle: {
    color: sheet.textPrimary,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '600',
  },
  secondaryRow: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
  },
  secondaryAction: {
    flex: 1,
    height: 64,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#28262C',
    backgroundColor: sheet.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  secondaryLabel: {
    color: sheet.textPrimary,
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryLabelActive: {
    color: sheet.mutedGold,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  busy: {
    opacity: interaction.busyOpacity,
  },
});
