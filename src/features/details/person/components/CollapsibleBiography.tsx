import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const PREVIEW_CHAR_LIMIT = 320;

interface CollapsibleBiographyProps {
  biography: string;
}

export function CollapsibleBiography({ biography }: CollapsibleBiographyProps) {
  const { t } = useTranslation();
  const shouldCollapse = biography.length > PREVIEW_CHAR_LIMIT;
  const [expanded, setExpanded] = useState(false);
  const displayText = shouldCollapse && !expanded
    ? `${biography.slice(0, PREVIEW_CHAR_LIMIT).trimEnd()}…`
    : biography;

  return (
    <View>
      <AppText variant="body" style={styles.biography}>
        {displayText}
      </AppText>
      {shouldCollapse ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => setExpanded((value) => !value)}
          hitSlop={8}
          testID="person-biography-toggle"
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
  biography: {
    paddingHorizontal: spacing.lg,
    lineHeight: 24,
  },
  toggle: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.sm,
    color: colors.accent,
    fontWeight: '600',
  },
});
