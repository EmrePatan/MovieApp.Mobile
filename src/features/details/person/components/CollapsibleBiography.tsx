import { StyleSheet } from 'react-native';
import { CollapsibleText } from '@/components/common/CollapsibleText';
import { spacing } from '@/theme/spacing';

interface CollapsibleBiographyProps {
  biography: string;
}

export function CollapsibleBiography({ biography }: CollapsibleBiographyProps) {
  return (
    <CollapsibleText
      text={biography}
      textStyle={styles.biography}
      toggleTestID="person-biography-toggle"
    />
  );
}

const styles = StyleSheet.create({
  biography: {
    paddingHorizontal: spacing.lg,
    lineHeight: 24,
  },
});
