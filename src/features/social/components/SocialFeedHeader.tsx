import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { GlassSurface } from '@/components/common/GlassSurface';
import { authTypography } from '@/features/auth/auth-typography';
import { spacing } from '@/theme/spacing';
import { socialFeedTheme } from './social-feed-theme';

interface SocialFeedHeaderProps {
  onSearchPress: () => void;
  onMessagesPress: () => void;
}

/** Editorial title row: serif "Akış" plus two glass circle actions. */
export function SocialFeedHeader({ onSearchPress, onMessagesPress }: SocialFeedHeaderProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <View style={styles.titleBlock}>
        <AppText style={styles.title} numberOfLines={1} accessibilityRole="header">
          {t('social.title')}
        </AppText>
        <AppText style={styles.subtitle} numberOfLines={1}>
          {t('social.feedSubtitle')}
        </AppText>
      </View>
      <View style={styles.actions}>
        <GlassSurface style={styles.circle}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('social.findPeople')}
            onPress={onSearchPress}
            style={({ pressed }) => [styles.circleHit, pressed && styles.pressed]}
          >
            <Ionicons name="search" size={18} color={socialFeedTheme.textPrimary} />
          </Pressable>
        </GlassSurface>
        <GlassSurface style={styles.circle}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('messages.inbox')}
            onPress={onMessagesPress}
            style={({ pressed }) => [styles.circleHit, pressed && styles.pressed]}
          >
            <Ionicons name="chatbubble-outline" size={18} color={socialFeedTheme.textPrimary} />
          </Pressable>
        </GlassSurface>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  titleBlock: {
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: socialFeedTheme.textSecondary,
  },
  title: {
    flexShrink: 1,
    fontFamily: authTypography.wordmarkSemibold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.4,
    color: socialFeedTheme.textPrimary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  circle: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  circleHit: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
