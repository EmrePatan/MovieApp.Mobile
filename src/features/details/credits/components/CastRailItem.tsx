import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import type { CastMember } from '../types';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface CastRailItemProps {
  member: CastMember;
  size: number;
}

export function CastRailItem({ member, size }: CastRailItemProps) {
  return (
    <View style={[styles.item, { width: size + spacing.sm }]} accessibilityRole="text">
      <View style={[styles.portrait, { width: size, height: size, borderRadius: size / 2 }]}>
        {member.profileImagePath ? (
          <CatalogImage
            path={member.profileImagePath}
            width={size}
            height={size}
            rounded
            accessibilityLabel={`${member.name} portrait`}
          />
        ) : (
          <View style={[styles.fallback, { width: size, height: size, borderRadius: size / 2 }]}>
            <Ionicons name="person-outline" size={28} color={colors.textMuted} />
          </View>
        )}
      </View>
      <AppText variant="caption" style={styles.name} numberOfLines={2}>
        {member.name}
      </AppText>
      {member.character ? (
        <AppText variant="caption" muted numberOfLines={2} style={styles.character}>
          {member.character}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    gap: 2,
  },
  portrait: {
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceElevated,
  },
  name: {
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  character: {
    textAlign: 'center',
    fontSize: 11,
  },
});
