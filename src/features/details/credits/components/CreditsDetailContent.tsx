import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, SectionList, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppText } from '@/components/common/AppText';
import { DetailBackButton } from '@/features/details/shared/components/DetailBackButton';
import { openPersonDetail } from '@/features/details/shared/navigation/person-detail-navigation';
import type { CastMember, CrewMember, CreditsResponse } from '../types';
import { groupCrewByDepartment } from '../utils/group-crew-by-department';
import { CreditCastRow } from './CreditCastRow';
import { CreditCrewRow } from './CreditCrewRow';
import { CreditsSegmentedControl, type CreditsTab } from './CreditsSegmentedControl';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface CreditsDetailContentProps {
  contentType: 'movie' | 'tv';
  contentId: string;
  credits: CreditsResponse;
  title?: string;
}

export function CreditsDetailContent({
  contentType,
  contentId,
  credits,
  title,
}: CreditsDetailContentProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<CreditsTab>(
    credits.cast.length > 0 ? 'cast' : 'crew',
  );

  const crewSections = useMemo(
    () => groupCrewByDepartment(credits.crew),
    [credits.crew],
  );

  const handleCastPress = useCallback(
    (member: CastMember) => {
      if (member.providerPersonId == null) {
        return;
      }

      openPersonDetail(router, member.providerPersonId);
    },
    [contentId, contentType, router, title],
  );

  const handleCrewPress = useCallback(
    (member: CrewMember) => {
      if (member.providerPersonId == null) {
        return;
      }

      openPersonDetail(router, member.providerPersonId);
    },
    [contentId, contentType, router, title],
  );

  const listHeader = (
    <View>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <DetailBackButton contentInset={false} />
        <View style={styles.header}>
          <AppText variant="title" style={styles.headerTitle}>
            {t('details.credits.title')}
          </AppText>
          {title ? (
            <AppText variant="bodySmall" muted numberOfLines={2}>
              {title}
            </AppText>
          ) : null}
        </View>
      </SafeAreaView>
      <CreditsSegmentedControl activeTab={activeTab} onTabChange={setActiveTab} />
    </View>
  );

  if (activeTab === 'cast') {
    return (
      <FlatList
        testID="credits-cast-list"
        data={credits.cast}
        keyExtractor={(item, index) => `${item.providerPersonId ?? item.name}-${index}`}
        renderItem={({ item }) => (
          <CreditCastRow member={item} contentType={contentType} onPress={handleCastPress} />
        )}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <SectionList
      testID="credits-crew-list"
      sections={crewSections}
      keyExtractor={(item, index) => `${item.providerPersonId ?? item.name}-${index}`}
      renderItem={({ item }) => <CreditCrewRow member={item} onPress={handleCrewPress} />}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <AppText variant="subtitle" style={styles.sectionTitle}>
            {section.title}
          </AppText>
        </View>
      )}
      ListHeaderComponent={listHeader}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
    />
  );
}

const styles = StyleSheet.create({
  headerSafeArea: {
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.xs,
  },
  headerTitle: {
    color: colors.textPrimary,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    backgroundColor: colors.background,
  },
  sectionTitle: {
    color: colors.textPrimary,
  },
});
