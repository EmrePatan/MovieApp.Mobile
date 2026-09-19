import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type AuthInputIcon = 'email' | 'lock' | 'person';

interface AuthInputProps extends TextInputProps {
  placeholder: string;
  error?: string;
  leadingIcon?: AuthInputIcon;
  showPasswordToggle?: boolean;
}

const ICON_MAP: Record<AuthInputIcon, keyof typeof Ionicons.glyphMap> = {
  email: 'mail-outline',
  lock: 'lock-closed-outline',
  person: 'person-outline',
};

export const AuthInput = forwardRef<TextInput, AuthInputProps>(function AuthInput(
  {
    placeholder,
    error,
    leadingIcon,
    showPasswordToggle = false,
    style,
    secureTextEntry,
    ...props
  },
  ref,
) {
  const { t } = useTranslation();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const inputId = props.nativeID ?? placeholder.toLowerCase().replace(/\s+/g, '-');
  const isSecure = showPasswordToggle ? !isPasswordVisible : secureTextEntry;

  return (
    <View style={styles.container}>
      <View style={[styles.field, error ? styles.fieldError : null]}>
        {leadingIcon ? (
          <Ionicons
            name={ICON_MAP[leadingIcon]}
            size={20}
            color="rgba(245, 245, 247, 0.55)"
            style={styles.leadingIcon}
          />
        ) : null}
        <TextInput
          ref={ref}
          accessibilityLabel={placeholder}
          nativeID={inputId}
          placeholder={placeholder}
          placeholderTextColor="rgba(161, 161, 181, 0.72)"
          style={[styles.input, style]}
          secureTextEntry={isSecure}
          {...props}
        />
        {showPasswordToggle ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible ? t('common.hidePassword') : t('common.showPassword')
            }
            hitSlop={8}
            onPress={() => setIsPasswordVisible((visible) => !visible)}
            style={styles.trailingButton}
          >
            <Ionicons
              name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="rgba(245, 245, 247, 0.55)"
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <AppText variant="caption" style={styles.error} accessibilityRole="alert">
          {error}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  field: {
    minHeight: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'rgba(12, 12, 18, 0.42)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  fieldError: {
    borderColor: 'rgba(255, 77, 79, 0.55)',
  },
  leadingIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
    paddingVertical: spacing.sm,
    minHeight: 24,
  },
  trailingButton: {
    marginLeft: spacing.sm,
    padding: 2,
  },
  error: {
    color: '#FFB4B4',
    paddingHorizontal: spacing.xs,
  },
});
