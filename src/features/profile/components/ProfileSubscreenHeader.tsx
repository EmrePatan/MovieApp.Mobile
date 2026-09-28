import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { MY_COMMENTS_HORIZONTAL_INSET } from '@/features/reviews/utils/my-comments-layout';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface ProfileSubscreenHeaderProps {
  title: string;
}

export function ProfileSubscreenHeader({ title }: ProfileSubscreenHeaderProps) {
  return (
    <View style={styles.header} accessibilityRole="header">
      <DetailBackButton showLabel={false} contentInset iconOnlyLeading />
      <AppText variant="subtitle" style={styles.title} numberOfLines={1}>
        {title}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: layout.touchTarget,
    paddingHorizontal: MY_COMMENTS_HORIZONTAL_INSET,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  title: {
    flexShrink: 1,
    fontWeight: '600',
    textAlign: 'left',
  },
});
