import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppBottomSheetChrome } from '@/components/layout/AppBottomSheet';
import { AppText } from '@/components/common/AppText';
import { AppButton } from '@/components/buttons/AppButton';
import { colors } from '@/theme/colors';
import { borderRadius, spacing } from '@/theme/spacing';
import { interaction } from '@/theme/interaction';
import { glass } from '@/theme/glass';

export type SocialReportReason = 'Spam' | 'Inappropriate' | 'Harassment' | 'FakeAccount';
export type SocialReportSheetKind = 'activity' | 'comment' | 'user';

const REASONS_BY_KIND: Record<SocialReportSheetKind, SocialReportReason[]> = {
  activity: ['Spam', 'Inappropriate', 'Harassment'],
  comment: ['Spam', 'Inappropriate', 'Harassment'],
  user: ['Spam', 'FakeAccount', 'Harassment'],
};

interface SocialReportReasonSheetProps {
  visible: boolean;
  kind: SocialReportSheetKind;
  title: string;
  subtitle?: string;
  onClose: () => void;
  onSelectReason: (reason: SocialReportReason) => void;
}

function reasonLabel(reason: SocialReportReason, t: ReturnType<typeof useTranslation>['t']) {
  switch (reason) {
    case 'Spam':
      return t('social.spam');
    case 'Inappropriate':
      return t('social.inappropriate');
    case 'Harassment':
      return t('social.harassment');
    case 'FakeAccount':
      return t('social.reportFakeAccount');
    default:
      return reason;
  }
}

export function SocialReportReasonSheet({
  visible,
  kind,
  title,
  subtitle,
  onClose,
  onSelectReason,
}: SocialReportReasonSheetProps) {
  const { t } = useTranslation();
  const reasons = REASONS_BY_KIND[kind];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      {visible ? (
        <AppBottomSheetChrome onClose={onClose} title={title} subtitle={subtitle} testID="social-report-sheet">
          <View style={styles.list}>
            {reasons.map((reason) => (
              <Pressable
                key={reason}
                accessibilityRole="button"
                accessibilityLabel={reasonLabel(reason, t)}
                onPress={() => onSelectReason(reason)}
                style={({ pressed }) => [styles.reasonRow, pressed && styles.reasonRowPressed]}
              >
                <AppText variant="body" style={styles.reasonLabel}>
                  {reasonLabel(reason, t)}
                </AppText>
              </Pressable>
            ))}
          </View>
          <AppButton title={t('social.cancel')} variant="ghost" onPress={onClose} />
        </AppBottomSheetChrome>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.xs,
  },
  reasonRow: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: glass.panelElevated,
  },
  reasonRowPressed: {
    opacity: interaction.pressedOpacity,
  },
  reasonLabel: {
    fontWeight: '500',
    color: colors.textPrimary,
  },
});