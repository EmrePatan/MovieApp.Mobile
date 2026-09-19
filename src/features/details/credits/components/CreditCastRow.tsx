import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import type { CastMember } from '../types';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { layout } from '@/theme/layout';
import { i18n } from '@/i18n';

interface CreditCastRowProps {
  member: CastMember;
  contentType: 'movie' | 'tv';
  onPress?: (member: CastMember) => void;
}

const PORTRAIT_SIZE = 52;

function getCastSubtitle(member: CastMember, contentType: 'movie' | 'tv'): string | null {
  if (contentType === 'tv') {
    const roles = member.roles ?? [];
    if (roles.length > 1) {
      const primaryRole = roles[0]?.character?.trim();
      return primaryRole ? `${primaryRole} · Multiple roles` : 'Multiple roles';
    }

    if (roles.length === 1) {
      return roles[0]?.character?.trim() || null;
    }
  }

  return member.character?.trim() || null;
}

function getEpisodeCountLabel(member: CastMember, contentType: 'movie' | 'tv'): string | null {
  if (contentType !== 'tv' || member.totalEpisodeCount == null || member.totalEpisodeCount < 1) {
    return null;
  }

  const count = member.totalEpisodeCount;
  return i18n.t(count === 1 ? 'common.episodeCount' : 'common.episodesCount', { count });
}

export const CreditCastRow = memo(function CreditCastRow({
  member,
  contentType,
  onPress,
}: CreditCastRowProps) {
  const { t } = useTranslation();
  const isPressable = Boolean(onPress && member.providerPersonId != null);
  const subtitle = getCastSubtitle(member, contentType);
  const episodeCountLabel = getEpisodeCountLabel(member, contentType);

  return (
    <Pressable
      accessibilityRole={isPressable ? 'button' : 'text'}
      accessibilityLabel={
        isPressable ? t('common.openProfileNamed', { name: member.name }) : member.name
      }
      disabled={!isPressable}
      onPress={() => onPress?.(member)}
      style={({ pressed }) => [styles.row, pressed && isPressable && styles.pressed]}
      testID={`credit-cast-row-${member.providerPersonId ?? member.name}`}
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
        {subtitle ? (
          <AppText variant="caption" muted numberOfLines={2}>
            {subtitle}
          </AppText>
        ) : null}
        {episodeCountLabel ? (
          <AppText variant="caption" muted numberOfLines={1}>
            {episodeCountLabel}
          </AppText>
        ) : null}
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
