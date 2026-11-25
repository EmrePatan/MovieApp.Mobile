import { Platform, Switch, type SwitchProps } from 'react-native';
import { colors } from '@/theme/colors';

/** Gold on/off switch. react-native-web ignores `thumbColor` when on, so it gets `activeThumbColor`. */
export function AppSwitch({ value, ...rest }: SwitchProps) {
  const webProps = Platform.OS === 'web' ? ({ activeThumbColor: colors.accent } as object) : null;
  return (
    <Switch
      accessibilityRole="switch"
      value={value}
      trackColor={{ false: colors.border, true: colors.accentMuted }}
      thumbColor={value ? colors.accent : colors.textMuted}
      {...webProps}
      {...rest}
    />
  );
}
