import { Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import type { SearchReturnOrigin } from '../search-navigation';
import { openSearch } from '../search-navigation';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface GlobalSearchEntryProps {
  origin: SearchReturnOrigin;
}

export function GlobalSearchEntry({ origin }: GlobalSearchEntryProps) {
  const router = useRouter();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Search movies, TV shows, and people"
      onPress={() => openSearch(router, origin)}
      style={({ pressed }) => [styles.entry, pressed && styles.pressed]}
    >
      <Ionicons name="search-outline" size={20} color={colors.textMuted} />
      <AppText variant="body" muted style={styles.placeholder}>
        Search movies, TV & people
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  pressed: {
    opacity: 0.85,
  },
});
