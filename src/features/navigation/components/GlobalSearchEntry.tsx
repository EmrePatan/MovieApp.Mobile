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

interface GlobalSearchEntryProps {
  origin: SearchReturnOrigin;
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

export function GlobalSearchEntry({ origin }: GlobalSearchEntryProps) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Search movies, TV shows, and people"
      onPress={() => openSearch(router, origin)}
      style={({ pressed }) => [styles.entry, pressed && styles.entryPressed]}
    >
      <Ionicons name="search-outline" size={20} color={colors.textMuted} />
      <AppText variant="body" muted style={styles.placeholder}>
        Search movies, TV & people
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
  placeholder: {
    flex: 1,
  },
  entryPressed: {
    opacity: 0.85,
  },
});
