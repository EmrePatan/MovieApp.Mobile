import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppSwitch } from '@/components/common/AppSwitch';
import { AppText } from '@/components/common/AppText';
import { Screen } from '@/components/common/Screen';
import { DetailBackButton } from '@/features/details/shared/components/DetailScreenScaffold';
import {
  useNotificationPreferences,
  useUpdateNotificationPreferences,
  type NotificationPreferences,
} from '@/features/notification-preferences/notification-preferences';
import { colors } from '@/theme/colors';
import { glass } from '@/theme/glass';
import { spacing } from '@/theme/spacing';

/** Push notification opt-outs, stored per account on the server. */
export default function NotificationPreferencesScreen() {
  const { t } = useTranslation();
  const query = useNotificationPreferences();
  const update = useUpdateNotificationPreferences();
  const settings = query.data;

  const change = (patch: Partial<NotificationPreferences>) => {
    if (!settings) return;
    update.mutate({ ...settings, ...patch });
  };

  const renderToggle = (
    key: keyof NotificationPreferences,
    label: string,
    description: string,
  ) => (
    <View style={styles.row} key={key}>
      <View style={styles.copy}>
        <AppText style={styles.rowTitle}>{label}</AppText>
        <AppText style={styles.rowDesc}>{description}</AppText>
      </View>
      <AppSwitch
        accessibilityLabel={label}
        accessibilityHint={description}
        value={settings?.[key] ?? true}
        onValueChange={(value) => change({ [key]: value })}
        testID={`notification-toggle-${key}`}
      />
    </View>
  );

  return (
    <Screen scrollable>
      <View style={styles.header}>
        <DetailBackButton />
        <AppText variant="title" accessibilityRole="header">
          {t('extras.notificationPrefsTitle')}
        </AppText>
        <AppText variant="bodySmall" muted>
          {t('extras.notificationPrefsDescription')}
        </AppText>
      </View>

      {query.isError ? (
        <View style={styles.center}>
          <AppText variant="bodySmall" muted>
            {t('extras.notificationPrefsError')}
          </AppText>
          <Pressable onPress={() => void query.refetch()} accessibilityRole="button">
            <AppText style={styles.retry}>{t('common.retry')}</AppText>
          </Pressable>
        </View>
      ) : query.isLoading || !settings ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <View style={styles.list}>
          {renderToggle(
            'messagePushEnabled',
            t('extras.notificationPrefsMessages'),
            t('extras.notificationPrefsMessagesDescription'),
          )}
          {renderToggle(
            'releasePushEnabled',
            t('extras.notificationPrefsReleases'),
            t('extras.notificationPrefsReleasesDescription'),
          )}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.md, marginBottom: spacing.xl },
  list: { gap: spacing.sm },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: 20,
    backgroundColor: glass.panel,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: glass.hairline,
  },
  copy: { flex: 1, gap: 4 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: colors.textPrimary },
  rowDesc: { fontSize: 12, lineHeight: 16, color: colors.textMuted },
  center: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  retry: { color: colors.accent, fontWeight: '600' },
});
