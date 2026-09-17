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
    <View style={styles.header} testID="library-watchlist-detail-header">
      <View style={styles.toolbar}>
        <View style={styles.leadingSlot}>
          <DetailBackButton contentInset />
        </View>
        <View style={styles.titleSlot}>
          <AppText variant="subtitle" numberOfLines={1} center style={styles.title}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" muted center numberOfLines={1}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        <View style={styles.trailingSlot}>
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
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: spacing.sm,
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.touchTarget,
  },
  leadingSlot: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  titleSlot: {
    flex: 2,
    justifyContent: 'center',
    gap: 2,
    paddingHorizontal: spacing.xs,
  },
  trailingSlot: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
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
    height: layout.touchTarget,
  },
  pressed: {
    opacity: 0.85,
  },
});
