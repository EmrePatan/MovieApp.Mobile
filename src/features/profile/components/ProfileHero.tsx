import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import type { UserProfileResponse } from '../types';
import { formatIsoDate } from '@/utils/format';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface ProfileHeroProps {
  profile: UserProfileResponse;
}

function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return 'MA';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function ProfileHero({ profile }: ProfileHeroProps) {
  const { t } = useTranslation();
  const initials = getInitials(profile.displayName);
  const formattedDate = profile.createdAt
    ? formatIsoDate(profile.createdAt.slice(0, 10))
    : null;

  return (
    <View style={styles.container}>
      <View
        style={styles.avatar}
        accessibilityLabel={t('profile.avatarAccessibility', { name: profile.displayName })}
      >
        <AppText variant="subtitle" style={styles.initials}>
          {initials}
        </AppText>
      </View>
      <View style={styles.copy}>
        <AppText variant="title" style={styles.name}>
          {profile.displayName}
        </AppText>
        <AppText variant="bodySmall" muted>
          {t('profile.identityTagline')}
        </AppText>
        {formattedDate ? (
          <AppText variant="caption" muted>
            {t('profile.memberSince', { date: formattedDate })}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: spacing.xs,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accentTint12,
    borderWidth: 1,
    borderColor: colors.accentTint18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.textPrimary,
  },
});
