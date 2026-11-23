import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { GlassSurface } from '@/components/common/GlassSurface';
import { premiumSheet, premiumSheetChrome } from '@/theme/premium-sheet';

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
    <View style={premiumSheetChrome.overlay} testID={testID}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('common.cancel')}
        style={premiumSheetChrome.backdrop}
        onPress={onClose}
      />
      <SafeAreaView
        style={[styles.sheet, align === 'center' && styles.sheetCentered]}
        edges={['bottom']}
      >
        <GlassSurface pointerEvents="none" style={[StyleSheet.absoluteFill, styles.glassLayer]} />
        <View style={premiumSheetChrome.handle} />
        {title ? (
          <AppText variant="subtitle" style={styles.title}>
            {title}
          </AppText>
        ) : null}
        {subtitle ? (
          <AppText variant="caption" center style={styles.subtitle}>
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
  sheet: {
    ...premiumSheetChrome.sheet,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    gap: 16,
  },
  glassLayer: {
    borderTopLeftRadius: premiumSheet.cornerRadius,
    borderTopRightRadius: premiumSheet.cornerRadius,
  },
  sheetCentered: {
    alignItems: 'center',
  },
  title: {
    ...premiumSheetChrome.title,
    textAlign: 'center',
  },
  subtitle: {
    color: premiumSheet.textSecondary,
    marginTop: -4,
  },
});
