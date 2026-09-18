import { type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthAtmosphere } from './AuthAtmosphere';
import { AuthBrandMark } from './AuthBrandMark';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface AuthScreenLayoutProps {
  tagline: string;
  headlineLines: readonly string[];
  headlineAccentLineIndex?: number;
  supportingCopy: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthScreenLayout({
  tagline,
  headlineLines,
  headlineAccentLineIndex = headlineLines.length - 1,
  supportingCopy,
  children,
  footer,
}: AuthScreenLayoutProps) {
  const { width } = useWindowDimensions();
  const headlineSize = width < 360 ? 30 : width < 390 ? 34 : 38;
  const headlineLineHeight = headlineSize + 6;

  return (
    <View style={styles.root}>
      <AuthAtmosphere />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.hero}>
                <AuthBrandMark />
                <AppText variant="caption" style={styles.tagline}>
                  {tagline}
                </AppText>

                <View style={styles.headlineBlock}>
                  {headlineLines.map((line, index) => (
                    <Text
                      key={`${line}-${index}`}
                      style={[
                        styles.headlineLine,
                        {
                          fontSize: headlineSize,
                          lineHeight: headlineLineHeight,
                        },
                        index === headlineAccentLineIndex && styles.headlineAccent,
                      ]}
                      maxFontSizeMultiplier={1.25}
                    >
                      {line}
                    </Text>
                  ))}
                </View>

                <AppText variant="bodySmall" style={styles.supportingCopy}>
                  {supportingCopy}
                </AppText>
              </View>

              <View style={styles.formSection}>{children}</View>

              {footer ? <View style={styles.footer}>{footer}</View> : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  content: {
    flexGrow: 1,
    gap: spacing.xl,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  hero: {
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  tagline: {
    color: 'rgba(245, 245, 247, 0.72)',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginTop: spacing.xs,
  },
  headlineBlock: {
    marginTop: spacing.md,
    gap: 2,
  },
  headlineLine: {
    color: colors.textPrimary,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  headlineAccent: {
    color: colors.accentStrong,
  },
  supportingCopy: {
    color: 'rgba(245, 245, 247, 0.78)',
    maxWidth: 320,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  formSection: {
    gap: spacing.lg,
  },
  footer: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
});
