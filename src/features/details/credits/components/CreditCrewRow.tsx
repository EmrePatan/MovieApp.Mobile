import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import type { CrewMember } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';

interface CreditCrewRowProps {
  member: CrewMember;
  onPress?: (member: CrewMember) => void;
}

const PORTRAIT_SIZE = 52;

export const CreditCrewRow = memo(function CreditCrewRow({ member, onPress }: CreditCrewRowProps) {
  const { t } = useTranslation();
  const isPressable = Boolean(onPress && member.providerPersonId != null);

  return (
    <Pressable
      accessibilityRole={isPressable ? 'button' : 'text'}
      accessibilityLabel={
        isPressable ? t('common.openProfileNamed', { name: member.name }) : member.name
      }
      disabled={!isPressable}
      onPress={() => onPress?.(member)}
      style={({ pressed }) => [styles.row, pressed && isPressable && styles.pressed]}
      testID={`credit-crew-row-${member.providerPersonId ?? member.name}`}
    >
      <View style={styles.portrait}>
        {member.profileImagePath ? (
          <CatalogImage
            path={member.profileImagePath}
            width={PORTRAIT_SIZE}
            height={PORTRAIT_SIZE}
            rounded
            accessibilityLabel={t('details.sections.personPortrait', { name: member.name })}
          />
        ) : (
          <View style={styles.fallback}>
            <Ionicons name="person-outline" size={24} color={colors.textMuted} />
          </View>
        )}
      </View>
      <View style={styles.meta}>
        <AppText variant="body" numberOfLines={2} style={styles.name}>
          {member.name}
        </AppText>
        <AppText variant="caption" muted numberOfLines={2}>
          {member.job}
        </AppText>
      </View>
      {isPressable ? <Ionicons name="chevron-forward" size={16} color={colors.textMuted} /> : null}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    minHeight: layout.touchTarget,
  },
  pressed: {
    opacity: interaction.pressedOpacity,
  },
  portrait: {
    width: PORTRAIT_SIZE,
    height: PORTRAIT_SIZE,
    borderRadius: PORTRAIT_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
    borderRadius: borderRadius.full,
  },
  meta: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  name: {
    color: colors.textPrimary,
  },
});
