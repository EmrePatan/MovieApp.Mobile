import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { GlassSurface } from '@/components/common/GlassSurface';
import { UserAvatar } from '@/components/common/UserAvatar';
import { spacing } from '@/theme/spacing';
import { socialFeedTheme } from './social-feed-theme';

interface SocialFeedComposerPromptProps {
  displayName: string;
  avatarUrl?: string | null;
  onPress: () => void;
}

/** "Ne izledin?" entry row: tap to pick a title and leave a review. */
export function SocialFeedComposerPrompt({
  displayName,
  avatarUrl,
  onPress,
}: SocialFeedComposerPromptProps) {
  const { t } = useTranslation();

  return (
    <GlassSurface style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('social.composerPrompt')}
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        testID="social-feed-composer-prompt"
      >
        <UserAvatar displayName={displayName} effectiveAvatarUrl={avatarUrl} size={36} />
        <AppText style={styles.prompt} numberOfLines={1}>
          {t('social.composerPrompt')}
        </AppText>
        <View style={styles.icon}>
          <Ionicons name="film-outline" size={18} color={socialFeedTheme.accent} />
        </View>
      </Pressable>
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
  },
  prompt: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    color: socialFeedTheme.textSecondary,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: socialFeedTheme.accentTint,
  },
  pressed: {
    opacity: 0.85,
  },
});
