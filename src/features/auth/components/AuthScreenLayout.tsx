import { type ReactNode, useEffect, useState } from 'react';
import {
  Keyboard,
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

function useAndroidKeyboardVisible(): boolean {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setIsKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return isKeyboardVisible;
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
  const isAndroidKeyboardOpen = useAndroidKeyboardVisible();
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const headlineSize = width < 360 ? 38 : width < 390 ? 44 : 48;
  const headlineLineHeight = Math.round(headlineSize * 1.02);
  const keyboardVerticalOffset = Platform.OS === 'ios' ? insets.top + spacing.sm : 0;

  const hero = (
    <View style={styles.hero}>
      <AuthBrandMark />

      <View style={styles.taglineBlock}>
        {taglineLines.map((line, index) => (
          <Text key={`${line}-${index}`} style={styles.taglineLine} maxFontSizeMultiplier={1.2}>
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
              index === headlineAccentLineIndex ? styles.headlineAccent : styles.headlineLead,
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
  );

  const formBlock = (
    <>
      <View style={styles.formSection}>{children}</View>
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </>
  );

  return (
    <View style={styles.root}>
      <AuthAtmosphere />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboard}
          keyboardVerticalOffset={keyboardVerticalOffset}
          onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
        >
          <ScrollView
            testID="auth-screen-scroll"
            contentContainerStyle={[
              styles.scrollContent,
              isAndroidKeyboardOpen && styles.scrollContentKeyboardOpen,
              viewportHeight != null ? { minHeight: viewportHeight } : null,
              { paddingBottom: Math.max(spacing.xl, insets.bottom + spacing.md) },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
          >
            <View
              testID={
                isAndroidKeyboardOpen
                  ? 'auth-screen-layout-keyboard-open'
                  : 'auth-screen-layout-keyboard-closed'
              }
              style={[
                styles.content,
                isAndroidKeyboardOpen && styles.contentKeyboardOpen,
              ]}
            >
              {hero}
              {isAndroidKeyboardOpen ? (
                <View style={styles.androidFormViewport}>{formBlock}</View>
              ) : (
                formBlock
              )}
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
  scrollContentKeyboardOpen: {
    justifyContent: 'flex-start',
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
  contentKeyboardOpen: {
    justifyContent: 'flex-start',
  },
  androidFormViewport: {
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
  },
  hero: {
    gap: spacing.sm + 2,
  },
  taglineBlock: {
    marginTop: spacing.xs,
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
