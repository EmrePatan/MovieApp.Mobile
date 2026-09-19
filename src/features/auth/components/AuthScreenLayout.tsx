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
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthAtmosphere } from './AuthAtmosphere';
import { AuthBrandMark } from './AuthBrandMark';
import { authTypography } from '../auth-typography';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

interface AuthScreenLayoutProps {
  taglineLines: readonly string[];
  headlineLines: readonly string[];
  headlineAccentLineIndex?: number;
  supportingCopy?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthScreenLayout({
  taglineLines,
  headlineLines,
  headlineAccentLineIndex = headlineLines.length - 1,
  supportingCopy,
  children,
  footer,
}: AuthScreenLayoutProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const headlineSize = width < 360 ? 38 : width < 390 ? 44 : 48;
  const headlineLineHeight = Math.round(headlineSize * 1.02);
  const keyboardVerticalOffset = Platform.OS === 'ios' ? insets.top + spacing.sm : 0;

  return (
    <View style={styles.root}>
      <AuthAtmosphere />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
          keyboardVerticalOffset={keyboardVerticalOffset}
        >
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: Math.max(spacing.xl, insets.bottom + spacing.md) },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.content}>
              <View style={styles.hero}>
                <AuthBrandMark />

                <View style={styles.taglineBlock}>
                  {taglineLines.map((line, index) => (
                    <Text
                      key={`${line}-${index}`}
                      style={styles.taglineLine}
                      maxFontSizeMultiplier={1.2}
                    >
                      {line}
                    </Text>
                  ))}
                </View>

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
                        index === headlineAccentLineIndex
                          ? styles.headlineAccent
                          : styles.headlineLead,
                      ]}
                      maxFontSizeMultiplier={1.2}
                    >
                      {line}
                    </Text>
                  ))}
                </View>

                {supportingCopy ? (
                  <Text style={styles.supportingCopy} maxFontSizeMultiplier={1.2}>
                    {supportingCopy}
                  </Text>
                ) : null}
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
    justifyContent: 'center',
  },
  content: {
    flexGrow: 1,
    gap: spacing.md + spacing.xs,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
    justifyContent: 'center',
  },
  hero: {
    gap: spacing.sm + 2,
  },
  taglineBlock: {
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  taglineLine: {
    color: 'rgba(245, 245, 247, 0.68)',
    fontSize: 10.5,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    lineHeight: 14,
  },
  headlineBlock: {
    marginTop: spacing.sm + spacing.xs,
    gap: 2,
  },
  headlineLine: {
    color: colors.textPrimary,
    textShadowColor: 'rgba(0, 0, 0, 0.72)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 10,
  },
  headlineLead: {
    fontFamily: authTypography.editorialLight,
    letterSpacing: 0.2,
  },
  headlineAccent: {
    color: colors.accentStrong,
    fontFamily: authTypography.editorialSemiboldItalic,
    letterSpacing: -0.4,
  },
  supportingCopy: {
    color: 'rgba(245, 245, 247, 0.78)',
    maxWidth: 320,
    marginTop: spacing.sm,
    lineHeight: 21,
    fontSize: 14,
  },
  formSection: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm + spacing.xs,
  },
});
