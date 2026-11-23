import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { buildCatalogDetailRoute } from '@/features/details/shared/routes';
import { parseChatMessage } from '../utils/chat-title-share';
import { formatNotificationRelativeTime } from '@/features/notifications/utils/format-notification-relative-time';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { DirectMessageItem } from '../types';
import { glass } from '@/theme/glass';

interface DirectMessageBubbleProps {
  message: DirectMessageItem;
  isMine: boolean;
}

export function DirectMessageBubble({ message, isMine }: DirectMessageBubbleProps) {
  const relativeTime = formatNotificationRelativeTime(message.createdAt);
  const router = useRouter();
  const { t } = useTranslation();
  const { text, share } = parseChatMessage(message.body);

  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
      <View style={[styles.bubble, isMine ? styles.bubbleMine : styles.bubbleTheirs]}>
        {share ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${share.title}. ${t('extras.openTitle')}`}
            onPress={() =>
              router.push(buildCatalogDetailRoute(share.id, share.contentType) as Href)
            }
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            testID="chat-title-card"
          >
            <View style={styles.cardPoster}>
              <CatalogImage
                path={share.posterPath}
                width={48}
                height={72}
                accessibilityLabel={share.title}
                rounded={false}
              />
            </View>
            <View style={styles.cardCopy}>
              <AppText style={styles.cardTitle} numberOfLines={2}>
                {share.title}
              </AppText>
              <AppText style={styles.cardMeta} numberOfLines={1}>
                {[share.contentType === 'tv' ? t('common.tv') : t('social.movies'), share.year]
                  .filter(Boolean)
                  .join(' · ')}
              </AppText>
            </View>
          </Pressable>
        ) : null}
        {text ? (
          <AppText style={[styles.body, isMine ? styles.bodyMine : styles.bodyTheirs]}>{text}</AppText>
        ) : null}
        {relativeTime ? (
          <AppText style={[styles.time, isMine ? styles.timeMine : styles.timeTheirs]}>{relativeTime}</AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.xs,
    flexDirection: 'row',
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowTheirs: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 4,
  },
  bubbleMine: {
    backgroundColor: colors.accent,
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    backgroundColor: glass.panelElevated,
    borderBottomLeftRadius: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderSubtle,
  },
  body: {
    fontSize: 15,
    lineHeight: 21,
  },
  bodyMine: {
    color: colors.background,
  },
  bodyTheirs: {
    color: colors.textPrimary,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.xs,
    borderRadius: 14,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  cardPressed: {
    opacity: 0.85,
  },
  cardPoster: {
    width: 48,
    height: 72,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardCopy: {
    flexShrink: 1,
    gap: 2,
    paddingRight: spacing.xs,
  },
  cardTitle: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardMeta: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  time: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  timeMine: {
    color: 'rgba(5, 5, 8, 0.72)',
  },
  timeTheirs: {
    color: colors.textMuted,
  },
});
