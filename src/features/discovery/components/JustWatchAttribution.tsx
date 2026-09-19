import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function JustWatchAttribution({ testID = 'justwatch-attribution' }: { testID?: string }) {
  const { t } = useTranslation();

  return (
    <AppText variant="caption" style={styles.attribution} testID={testID}>
      {t('common.dataProvidedByJustWatch')}
    </AppText>
  );
}

const styles = StyleSheet.create({
  attribution: {
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
