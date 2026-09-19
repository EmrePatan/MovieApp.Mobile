import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type StyleProp, type TextStyle } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const DEFAULT_PREVIEW_CHAR_LIMIT = 320;

interface CollapsibleTextProps {
  text: string;
  previewCharLimit?: number;
  textStyle?: StyleProp<TextStyle>;
  toggleTestID?: string;
}

export function CollapsibleText({
  text,
  previewCharLimit = DEFAULT_PREVIEW_CHAR_LIMIT,
  textStyle,
  toggleTestID,
}: CollapsibleTextProps) {
  const { t } = useTranslation();
  const shouldCollapse = text.length > previewCharLimit;
  const [expanded, setExpanded] = useState(false);
  const displayText =
    shouldCollapse && !expanded ? `${text.slice(0, previewCharLimit).trimEnd()}…` : text;

  return (
    <View>
      <AppText variant="body" muted style={textStyle}>
        {displayText}
      </AppText>
      {shouldCollapse ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setExpanded((value) => !value)}
          hitSlop={8}
          testID={toggleTestID}
        >
          <AppText variant="caption" style={styles.toggle}>
            {expanded ? t('common.showLess') : t('common.readMore')}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    marginTop: spacing.sm,
    color: colors.accent,
    fontWeight: '600',
  },
});
