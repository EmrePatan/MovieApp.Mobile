import { type ReactNode, useEffect, useState } from 'react';
import {
  Keyboard,
  type KeyboardEvent,
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

function useKeyboardEndCoordinates(): KeyboardEvent['endCoordinates'] | null {
  const [endCoordinates, setEndCoordinates] = useState<KeyboardEvent['endCoordinates'] | null>(null);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setEndCoordinates(event.endCoordinates);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setEndCoordinates(null);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return endCoordinates;
}

export function AuthScreenLayout({
  taglineLines,
  headlineLines,
  headlineAccentLineIndex = headlineLines.length - 1,
  supportingCopy,
  children,
  footer,
}: AuthScreenLayoutProps) {
  const { width, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const keyboardEndCoordinates = useKeyboardEndCoordinates();
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const headlineSize = width < 360 ? 38 : width < 390 ? 44 : 48;
  const headlineLineHeight = Math.round(headlineSize * 1.02);
  const bottomPadding = Math.max(spacing.xl, insets.bottom + spacing.md);
  const isKeyboardVisible = keyboardEndCoordinates != null;
  const viewportShrunk =
    viewportHeight != null && windowHeight > 0 && viewportHeight < windowHeight * 0.85;
  const formStageMinHeight =
    isKeyboardVisible && viewportHeight != null
      ? Platform.OS === 'android' && viewportShrunk
        ? Math.max(0, viewportHeight - bottomPadding - spacing.md)
        : Math.max(
            0,
            viewportHeight -
              (keyboardEndCoordinates?.height ?? 0) -
              bottomPadding -
              spacing.md,
          )
      : undefined;

  return (
    <View style={styles.root}>
      <AuthAtmosphere />

      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <View
          testID="auth-screen-viewport"
          style={styles.viewport}
          onLayout={(event) => setViewportHeight(event.nativeEvent.layout.height)}
        >
          <ScrollView
            testID="auth-screen-scroll"
            contentContainerStyle={[
              styles.scrollContent,
              viewportHeight != null ? { minHeight: viewportHeight } : null,
              { paddingBottom: bottomPadding },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
          >
            <View
              testID="auth-screen-layout-content"
              style={[
                styles.content,
                viewportHeight != null ? { minHeight: viewportHeight - bottomPadding } : null,
                isKeyboardVisible ? styles.contentKeyboardVisible : styles.contentKeyboardHidden,
              ]}
            >
              <View
                testID="auth-screen-hero"
                style={[styles.hero, isKeyboardVisible ? styles.detachedChrome : null]}
                pointerEvents={isKeyboardVisible ? 'none' : 'auto'}
              >
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

              <View
                testID="auth-screen-form-stage"
                style={[
                  styles.formStage,
                  isKeyboardVisible ? styles.formStageKeyboardVisible : null,
                  formStageMinHeight != null ? { minHeight: formStageMinHeight } : null,
                ]}
              >
                <View style={styles.formSection}>{children}</View>
              </View>

              {footer ? (
                <View
                  testID="auth-screen-footer"
                  style={[styles.footer, isKeyboardVisible ? styles.detachedChrome : null]}
                  pointerEvents={isKeyboardVisible ? 'none' : 'auto'}
                >
                  {footer}
                </View>
              ) : null}
            </View>
          </ScrollView>
        </View>
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
  viewport: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flexGrow: 1,
    gap: spacing.md + spacing.xs,
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.md,
    maxWidth: layout.maxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  contentKeyboardHidden: {
    justifyContent: 'center',
  },
  contentKeyboardVisible: {
    justifyContent: 'flex-start',
  },
  detachedChrome: {
    position: 'absolute',
    width: 0,
    height: 0,
    overflow: 'hidden',
    opacity: 0,
  },
  hero: {
    gap: spacing.sm + 2,
  },
  formStage: {
    width: '100%',
  },
  formStageKeyboardVisible: {
    flexGrow: 1,
    justifyContent: 'center',
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
