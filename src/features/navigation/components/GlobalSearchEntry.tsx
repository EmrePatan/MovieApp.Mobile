import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { SearchReturnOrigin } from '../search-navigation';
import { openSearch } from '../search-navigation';
import { HOME_HEADER_COMPACT_TARGET } from '@/features/home/components/home-header-styles';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { interaction } from '@/theme/interaction';
import { borderRadius, spacing } from '@/theme/spacing';

type GlobalSearchEntryVariant = 'default' | 'discover';

interface GlobalSearchEntryProps {
  origin: SearchReturnOrigin;
  variant?: GlobalSearchEntryVariant;
}

interface GlobalSearchIconButtonProps {
  origin: SearchReturnOrigin;
  overlay?: boolean;
  compact?: boolean;
}

export function GlobalSearchIconButton({
  origin,
  overlay = false,
  compact = false,
}: GlobalSearchIconButtonProps) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Search movies, TV shows, and people"
      onPress={() => openSearch(router, origin)}
      style={({ pressed }) => [
        styles.iconButton,
        compact && styles.iconButtonCompact,
        overlay && !compact && styles.iconButtonOverlay,
        pressed && styles.pressed,
      ]}
    >
      <Ionicons
        name="search-outline"
        size={compact ? (overlay ? 20 : 22) : overlay ? 24 : 26}
        color={colors.textPrimary}
      />
    </Pressable>
  );
}

const DISCOVER_SEARCH_PLACEHOLDER = 'Search movies, shows & people';

export function GlobalSearchEntry({ origin, variant = 'default' }: GlobalSearchEntryProps) {
  const router = useRouter();
  const isDiscover = variant === 'discover';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Search movies, TV shows, and people"
      onPress={() => openSearch(router, origin)}
      testID={isDiscover ? 'discover-search-entry' : 'global-search-entry'}
      style={({ pressed }) => [
        styles.entry,
        isDiscover && styles.entryDiscover,
        pressed && (isDiscover ? styles.entryDiscoverPressed : styles.entryPressed),
      ]}
    >
      <Ionicons
        name="search-outline"
        size={isDiscover ? 18 : 20}
        color={isDiscover ? colors.accentMuted : colors.textMuted}
      />
      <AppText
        variant={isDiscover ? 'bodySmall' : 'body'}
        muted
        style={[styles.placeholder, isDiscover && styles.placeholderDiscover]}
      >
        {isDiscover ? DISCOVER_SEARCH_PLACEHOLDER : 'Search movies, TV & people'}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    minWidth: layout.touchTarget,
    minHeight: layout.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonCompact: {
    minWidth: HOME_HEADER_COMPACT_TARGET,
    minHeight: HOME_HEADER_COMPACT_TARGET,
  },
  iconButtonOverlay: {
    minWidth: 40,
    minHeight: 40,
  },
  pressed: {
    opacity: interaction.subtlePressedOpacity,
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    paddingHorizontal: spacing.md,
    minHeight: 48,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  entryDiscover: {
    marginHorizontal: 0,
    minHeight: 50,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceElevated,
  },
  placeholder: {
    flex: 1,
  },
  placeholderDiscover: {
    color: colors.textSecondary,
    letterSpacing: 0.1,
  },
  entryPressed: {
    opacity: 0.85,
  },
  entryDiscoverPressed: {
    opacity: interaction.pressedOpacity,
    borderColor: colors.borderAccent,
    backgroundColor: colors.accentTint12,
  },
});
