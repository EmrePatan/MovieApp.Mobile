import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import type { LibraryRemoveIcon } from '../types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface LibraryEmptyStateProps {
  icon?: LibraryRemoveIcon | 'library';
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function resolveIconName(icon: LibraryEmptyStateProps['icon']): keyof typeof Ionicons.glyphMap {
  switch (icon) {
    case 'heart':
      return 'heart-outline';
    case 'bookmark':
      return 'bookmark-outline';
    case 'library':
    default:
      return 'albums-outline';
  }
}

export function LibraryEmptyState({
  icon = 'library',
  title,
  message,
  actionLabel,
  onAction,
}: LibraryEmptyStateProps) {
  return (
    <View style={styles.container} accessibilityRole="text">
      <View style={styles.iconWrap}>
        <Ionicons name={resolveIconName(icon)} size={40} color={colors.textMuted} />
      </View>
      <AppText variant="subtitle" center>
        {title}
      </AppText>
      {message ? (
        <AppText variant="bodySmall" muted center>
          {message}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <AppButton title={actionLabel} onPress={onAction} style={styles.button} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
    alignItems: 'center',
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
    alignSelf: 'stretch',
  },
});
