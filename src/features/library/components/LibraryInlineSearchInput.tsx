import { Pressable, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { homeHeaderStyles } from '@/features/home/components/home-header-styles';
import { colors } from '@/theme/colors';
import { interaction } from '@/theme/interaction';
import { typography } from '@/theme/typography';

interface LibraryInlineSearchInputProps {
  value: string;
  onChangeText: (value: string) => void;
  onClear: () => void;
  overlay?: boolean;
}

export function LibraryInlineSearchInput({
  value,
  onChangeText,
  onClear,
  overlay = false,
}: LibraryInlineSearchInputProps) {
  const { t } = useTranslation();
  const iconSize = overlay ? 20 : 23;
  const showClear = value.length > 0;

  return (
    <View style={homeHeaderStyles.searchSection}>
      <Ionicons name="search-outline" size={iconSize} color={colors.textMuted} />
      <TextInput
        accessibilityLabel={t('library.hub.searchPlaceholder')}
        accessibilityRole="search"
        value={value}
        onChangeText={onChangeText}
        placeholder={t('library.hub.searchPlaceholder')}
        placeholderTextColor={colors.textMuted}
        style={[homeHeaderStyles.searchPlaceholder, typography.bodySmall]}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="never"
      />
      {showClear ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('search.bar.clear')}
          onPress={onClear}
          hitSlop={8}
          style={({ pressed }) => pressed && { opacity: interaction.subtlePressedOpacity }}
        >
          <Ionicons name="close-circle" size={20} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}
