import { type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { Screen } from '@/components/common/Screen';
import { AppText } from '@/components/common/AppText';
import { AuthAtmosphere } from './AuthAtmosphere';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { shadows } from '@/theme/shadows';

interface AuthScreenLayoutProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthScreenLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: AuthScreenLayoutProps) {
  return (
    <View style={styles.root}>
      <AuthAtmosphere />
      <Screen scrollable padded={false}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
        >
          <View style={styles.content}>
            <View style={styles.brandBlock}>
              <AppText variant="caption" style={styles.eyebrow}>
                {eyebrow}
              </AppText>
              <AppText variant="hero" style={styles.title}>
                {title}
              </AppText>
              <View style={styles.titleRule} />
              <AppText variant="body" muted center style={styles.subtitle}>
                {subtitle}
              </AppText>
            </View>

            <View style={styles.card}>{children}</View>

            {footer ? <View style={styles.footer}>{footer}</View> : null}
          </View>
        </KeyboardAvoidingView>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: spacing.xl,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingVertical: layout.screenPaddingVertical,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  brandBlock: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  eyebrow: {
    color: colors.accentStrong,
    textTransform: 'uppercase',
    letterSpacing: 2.4,
    fontWeight: '600',
  },
  title: {
    color: colors.textPrimary,
    textAlign: 'center',
  },
  titleRule: {
    width: 56,
    height: 2,
    borderRadius: borderRadius.full,
    backgroundColor: colors.accent,
    marginTop: spacing.xs,
  },
  subtitle: {
    maxWidth: 300,
  },
  card: {
    gap: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.accentSurface,
    borderWidth: 1,
    borderColor: colors.borderAccent,
    ...shadows.card,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
  },
});
