import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/components/common/Screen';
import { AppText } from '@/components/common/AppText';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { SharedWatchlistsContent } from '@/features/watchlist-share/components/SharedWatchlistsContent';
import { spacing } from '@/theme/spacing';

const HORIZONTAL_INSET = spacing.lg;

export default function SharedListsScreen() {
  const { t } = useTranslation();

  return (
    <Screen>
      <View style={styles.header} accessibilityRole="header">
        <DetailBackButton showLabel={false} />
        <AppText variant="subtitle" style={styles.title}>
          {t('profile.sharedLists.title')}
        </AppText>
        <AppText variant="caption" muted style={styles.subtitle}>
          {t('profile.sharedLists.subtitle')}
        </AppText>
      </View>
      <SharedWatchlistsContent />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: HORIZONTAL_INSET,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    fontWeight: '600',
  },
  subtitle: {
    marginBottom: spacing.xs,
  },
});
