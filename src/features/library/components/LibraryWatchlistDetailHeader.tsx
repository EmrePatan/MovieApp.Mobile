import { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { borderRadius, spacing } from '@/theme/spacing';

interface LibraryWatchlistDetailHeaderProps {
  title: string;
  subtitle?: string;
  onOverflowPress?: () => void;
  overflowAccessibilityLabel?: string;
  children?: ReactNode;
}

export function LibraryWatchlistDetailHeader({
  title,
  subtitle,
  onOverflowPress,
  overflowAccessibilityLabel = 'Watchlist options',
  children,
}: LibraryWatchlistDetailHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.navRow}>
        <DetailBackButton contentInset />
        {onOverflowPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={overflowAccessibilityLabel}
            hitSlop={8}
            onPress={onOverflowPress}
            style={({ pressed }) => [styles.overflowButton, pressed && styles.pressed]}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
          </Pressable>
        ) : (
          <View style={styles.overflowPlaceholder} />
        )}
      </View>
      <View style={styles.titleBlock}>
        <AppText variant="subtitle" numberOfLines={2} style={styles.title}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" muted>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  overflowButton: {
    width: layout.touchTarget,
    height: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  overflowPlaceholder: {
    width: layout.touchTarget,
  },
  titleBlock: {
    gap: 2,
  },
  title: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
});
