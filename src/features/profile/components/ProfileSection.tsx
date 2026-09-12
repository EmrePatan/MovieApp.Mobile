import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

interface ProfileSectionProps {
  title: string;
  children: ReactNode;
  variant?: 'card' | 'plain';
}

export function ProfileSection({ title, children, variant = 'card' }: ProfileSectionProps) {
  return (
    <View style={styles.section}>
      <AppText variant="subtitle">{title}</AppText>
      {variant === 'card' ? <View style={styles.content}>{children}</View> : children}
    </View>
  );
}

interface ProfileMenuRowProps {
  label: string;
  subtitle?: string;
  destructive?: boolean;
  onPress: () => void;
}

export function ProfileMenuRow({
  label,
  subtitle,
  destructive = false,
  onPress,
}: ProfileMenuRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={styles.rowText}>
        <AppText variant="body" style={destructive ? styles.destructive : undefined}>
          {label}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" muted>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      <Ionicons
        name="chevron-forward"
        size={18}
        color={destructive ? colors.error : colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  content: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: {
    opacity: 0.85,
  },
  rowText: {
    flex: 1,
    gap: spacing.xs,
    paddingRight: spacing.sm,
  },
  destructive: {
    color: colors.error,
  },
});
