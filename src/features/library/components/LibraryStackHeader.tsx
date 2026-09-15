import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { DetailBackButton } from '@/features/details/shared/components/DetailBackButton';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface LibraryStackHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export function LibraryStackHeader({ title, subtitle, children }: LibraryStackHeaderProps) {
  return (
    <View style={styles.header}>
      <DetailBackButton contentInset />
      <AppText variant="title">{title}</AppText>
      {subtitle ? (
        <AppText variant="bodySmall" muted style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.md,
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.sm,
    paddingBottom: spacing.md,
  },
  subtitle: {
    lineHeight: 20,
  },
});
