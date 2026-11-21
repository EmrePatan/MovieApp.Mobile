import { ActivityIndicator, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { borderRadius, spacing } from '@/theme/spacing';
import { layout } from '@/theme/layout';
import { socialFeedTheme } from './social-feed-theme';

interface SocialCommentComposerProps {
  draftText: string;
  placeholder: string;
  isSending: boolean;
  /** Extra bottom inset when tab bar already consumes safe-area (default true). */
  sitAboveTabBar?: boolean;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

const INPUT_LINE = 20;
const INPUT_PAD_V = Platform.select({ ios: 12, android: 10, default: 11 })!;
const SHELL_MIN = INPUT_LINE + INPUT_PAD_V * 2;

/**
 * Compact Black Titanium comment / reply dock.
 * Text-only — media belongs on the review composer.
 */
export function SocialCommentComposer({
  draftText,
  placeholder,
  isSending,
  sitAboveTabBar = true,
  onChangeText,
  onSend,
}: SocialCommentComposerProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const canSend = draftText.trim().length > 0 && !isSending;
  const bottomPad = sitAboveTabBar ? spacing.xs : Math.max(insets.bottom, spacing.sm);

  return (
    <View style={[styles.dock, { paddingBottom: bottomPad }]}>
      <View style={styles.row}>
        <View style={styles.inputShell}>
          <Ionicons name="pencil-outline" size={15} color={socialFeedTheme.textMuted} />
          <TextInput
            accessibilityLabel={placeholder}
            value={draftText}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={socialFeedTheme.textMuted}
            multiline
            maxLength={2000}
            style={styles.input}
            textAlignVertical="center"
            {...(Platform.OS === 'android' ? { includeFontPadding: false } : null)}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('social.send')}
          disabled={!canSend}
          onPress={onSend}
          style={({ pressed }) => [
            styles.send,
            !canSend && styles.sendIdle,
            pressed && canSend && styles.pressed,
          ]}
        >
          {isSending ? (
            <ActivityIndicator color={socialFeedTheme.background} size="small" />
          ) : (
            <Ionicons name="paper-plane" size={16} color={socialFeedTheme.background} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: socialFeedTheme.border,
    backgroundColor: socialFeedTheme.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputShell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: SHELL_MIN,
    maxHeight: 120,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    backgroundColor: socialFeedTheme.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: socialFeedTheme.border,
  },
  input: {
    flex: 1,
    margin: 0,
    paddingTop: INPUT_PAD_V,
    paddingBottom: INPUT_PAD_V,
    paddingHorizontal: 0,
    maxHeight: 112,
    color: socialFeedTheme.textPrimary,
    fontSize: 15,
    lineHeight: INPUT_LINE,
  },
  send: {
    width: SHELL_MIN,
    height: SHELL_MIN,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: socialFeedTheme.accent,
  },
  sendIdle: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.88,
  },
});
