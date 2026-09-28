import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';

type AppBottomSheetAlign = 'center' | 'stretch';

interface AppBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  align?: AppBottomSheetAlign;
  testID?: string;
  children: ReactNode;
}

interface AppBottomSheetFrameProps extends Omit<AppBottomSheetProps, 'visible'> {}

function AppBottomSheetFrame({
  onClose,
  title,
  subtitle,
  align = 'stretch',
  testID,
  children,
}: AppBottomSheetFrameProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.overlay} testID={testID}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.cancel')}
        style={styles.backdrop}
        onPress={onClose}
      />
      <SafeAreaView
        style={[styles.sheet, align === 'center' && styles.sheetCentered]}
        edges={['bottom']}
      >
        <View style={styles.handle} />
        {title ? (
          <AppText variant="subtitle" style={styles.title}>
            {title}
          </AppText>
        ) : null}
        {subtitle ? (
          <AppText variant="caption" muted center style={styles.subtitle}>
            {subtitle}
          </AppText>
        ) : null}
        {children}
      </SafeAreaView>
    </View>
  );
}

export function AppBottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  align,
  testID,
  children,
}: AppBottomSheetProps) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {visible ? (
        <AppBottomSheetFrame
          onClose={onClose}
          title={title}
          subtitle={subtitle}
          align={align}
          testID={testID}
        >
          {children}
        </AppBottomSheetFrame>
      ) : null}
    </Modal>
  );
}

/** Sheet chrome without Modal — for screens that already own a Modal wrapper. */
export function AppBottomSheetChrome({
  onClose,
  title,
  subtitle,
  align,
  testID,
  children,
}: AppBottomSheetFrameProps) {
  return (
    <AppBottomSheetFrame
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      align={align}
      testID={testID}
    >
      {children}
    </AppBottomSheetFrame>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: colors.overlay,
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  sheetCentered: {
    alignItems: 'center',
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.border,
    marginBottom: spacing.xs,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    marginTop: -spacing.sm,
  },
});
