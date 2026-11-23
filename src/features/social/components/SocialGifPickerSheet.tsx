import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { fetchTrendingGiphy, isFetchCanceled, searchGiphy, type GiphyResult } from '../api/giphy';
import { getGiphyApiKey } from '../utils/giphy-api-key';
import { premiumSheet, premiumSheetChrome } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';
import { GlassSheetLayer } from '@/components/common/GlassSheetLayer';

interface SocialGifPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (gifUrl: string) => void;
}

export function SocialGifPickerSheet({ visible, onClose, onSelect }: SocialGifPickerSheetProps) {
  const { t } = useTranslation();
  const giphyKey = getGiphyApiKey();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GiphyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [wasVisible, setWasVisible] = useState(visible);

  // Reset the picker when it closes. Adjusting state during render (instead of
  // in an effect) avoids an extra cascading render.
  if (wasVisible !== visible) {
    setWasVisible(visible);
    if (!visible) {
      setQuery('');
      setResults([]);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!visible) {
      return;
    }

    const apiKey = getGiphyApiKey();
    if (!apiKey) {
      return;
    }

    const controller = new AbortController();
    const trimmed = query.trim();
    const delayMs = trimmed.length > 0 ? 320 : 0;

    const timer = setTimeout(() => {
      setLoading(true);
      const request = trimmed
        ? searchGiphy(trimmed, apiKey, controller.signal)
        : fetchTrendingGiphy(apiKey, controller.signal);

      void request
        .then((items) => {
          if (!controller.signal.aborted) setResults(items);
        })
        .catch((error: unknown) => {
          if (isFetchCanceled(error, controller.signal.aborted)) return;
          if (!controller.signal.aborted) setResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, delayMs);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, visible]);

  const handlePick = useCallback(
    (gifUrl: string) => {
      onSelect(gifUrl);
      onClose();
    },
    [onClose, onSelect],
  );

  const showEmptySearch = !loading && query.trim().length > 0 && results.length === 0;

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={premiumSheetChrome.overlay}>
        <View style={styles.sheet}>
          <GlassSheetLayer />
          <View style={premiumSheetChrome.handle} />
          <View style={styles.header}>
            <AppText variant="subtitle" style={styles.headerTitle}>{t('social.pickGif')}</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel={t('social.cancel')} onPress={onClose}>
              <AppText variant="bodySmall" style={styles.close}>
                {t('social.cancel')}
              </AppText>
            </Pressable>
          </View>
          {!giphyKey ? (
            <AppText variant="caption" muted style={styles.hint}>
              {t('social.gifApiMissing')}
            </AppText>
          ) : null}
          <TextInput
            accessibilityLabel={t('social.searchGif')}
            value={query}
            onChangeText={setQuery}
            placeholder={t('social.searchGif')}
            placeholderTextColor={premiumSheet.textSecondary}
            style={styles.input}
            autoCorrect={false}
          />
          {!query.trim() && results.length > 0 ? (
            <AppText variant="caption" muted style={styles.sectionLabel}>
              {t('social.gifTrending')}
            </AppText>
          ) : null}
          {loading ? <ActivityIndicator color={premiumSheet.mutedGold} style={styles.loader} /> : null}
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.columns}
            contentContainerStyle={styles.grid}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('social.pickGif')}
                onPress={() => handlePick(item.fullUrl)}
                style={styles.tile}
              >
                <Image source={{ uri: item.previewUrl }} style={styles.preview} contentFit="cover" />
              </Pressable>
            )}
            ListEmptyComponent={
              showEmptySearch ? (
                <AppText variant="caption" muted center style={styles.hint}>
                  {t('social.gifNoResults')}
                </AppText>
              ) : !loading && !query.trim() && giphyKey ? (
                <AppText variant="caption" muted center style={styles.hint}>
                  {t('social.gifLoadError')}
                </AppText>
              ) : null
            }
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sheet: {
    ...premiumSheetChrome.sheet,
    maxHeight: '78%',
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    color: premiumSheet.textPrimary,
    fontWeight: '700',
  },
  close: { color: premiumSheet.mutedGold },
  input: {
    borderWidth: 1,
    borderColor: premiumSheet.rowBorder,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: premiumSheet.textPrimary,
    backgroundColor: premiumSheet.secondary,
  },
  sectionLabel: { paddingTop: spacing.xs },
  loader: { paddingVertical: spacing.sm },
  grid: { gap: spacing.sm, paddingBottom: spacing.xl },
  columns: { gap: spacing.sm },
  tile: {
    flex: 1,
    aspectRatio: 1.2,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: premiumSheet.secondary,
  },
  preview: { width: '100%', height: '100%' },
  hint: { paddingVertical: spacing.sm },
});