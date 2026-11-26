import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';
import type { DetailExtras } from '../types/detail-extras';
import { buildDetailFacts } from '../utils/detail-facts';

/** A quiet, unboxed section: same header language as the reviews row. */
export function DetailFacts({ extras }: { extras: DetailExtras | null | undefined }) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const facts = buildDetailFacts(extras);

  if (facts.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}
        testID="detail-facts-toggle"
      >
        <AppText variant="subtitle" style={styles.title}>
          {t('details.sections.facts')}
        </AppText>
        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={16}
          color={colors.textMuted}
        />
      </Pressable>
      {expanded ? (
        <View style={styles.body}>
          {facts.map((fact) => (
            <View
              key={fact.label}
              style={styles.row}
              accessible
              accessibilityLabel={`${fact.label}: ${fact.value}`}
            >
              <AppText variant="bodySmall" style={styles.label}>
                {fact.label}
              </AppText>
              <AppText variant="bodySmall" style={styles.value}>
                {fact.value}
              </AppText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: layout.screenPaddingHorizontal,
    minHeight: layout.touchTarget,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  title: {
    flex: 1,
    color: colors.textPrimary,
    letterSpacing: 0.15,
  },
  body: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: glass.hairline,
  },
  label: {
    color: colors.textMuted,
  },
  value: {
    flex: 1,
    textAlign: 'right',
    color: colors.textPrimary,
  },
});
