import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { spacing } from '@/theme/spacing';

interface SpoilerGateProps {
  /** When false the children render untouched. */
  spoiler: boolean;
  children: ReactNode;
}

/** Hides spoiler-flagged content behind a tap-to-reveal warning. */
export function SpoilerGate({ spoiler, children }: SpoilerGateProps) {
  const { t } = useTranslation();
  const [revealed, setRevealed] = useState(false);

  if (!spoiler || revealed) {
    return <>{children}</>;
  }

  return (
    <Pressable
      // On web a button role renders a <button>, which is invalid inside the review card's own button.
      accessibilityRole={Platform.OS === 'web' ? undefined : 'button'}
      accessibilityLabel={`${t('reviews.spoilerHidden')}. ${t('reviews.spoilerReveal')}`}
      onPress={() => setRevealed(true)}
      style={({ pressed }) => [styles.gate, pressed && styles.pressed]}
      testID="spoiler-gate"
    >
      <Ionicons name="eye-off-outline" size={18} color={colors.accentStrong} />
      <View style={styles.copy}>
        <AppText variant="bodySmall" style={styles.title}>
          {t('reviews.spoilerHidden')}
        </AppText>
      </View>
      <View style={styles.reveal}>
        <AppText variant="caption" style={styles.revealLabel}>
          {t('reviews.spoilerReveal')}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  gate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(236, 210, 150, 0.35)',
    backgroundColor: 'rgba(212, 179, 106, 0.1)',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.textPrimary,
    fontWeight: '600',
  },
  reveal: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(212, 179, 106, 0.18)',
  },
  revealLabel: {
    color: colors.accentStrong,
    fontWeight: '700',
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
});
