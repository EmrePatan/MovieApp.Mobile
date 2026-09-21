import { useCallback, useEffect, useMemo, useState } from 'react';
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
import {
  logRouteLayoutMeta,
  routeLayoutHandler,
  useRouteLayoutContext,
} from '@/debug/route-layout-probe';
import { logRouteScreenMount, useRouteScreenProbe } from '@/debug/route-screen-probe';
import { ROUTE_OWNERSHIP_AUDIT } from '@/debug/route-ownership-audit';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const LAYOUT_SCOPE = 'cast-see-all';

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
  const route = useRouteLayoutContext();
  const { onRootLayout: onCastRootLayout } = useRouteScreenProbe('cast-see-all', {
    renderer: 'FlatList',
  });
  const [activeTab, setActiveTab] = useState<CreditsTab>(
    credits.cast.length > 0 ? 'cast' : 'crew',
  );

  useEffect(() => {
    logRouteScreenMount('cast-see-all', {
      ownership: ROUTE_OWNERSHIP_AUDIT.castSeeAll,
      dataCount: credits.cast.length,
    });
  }, [credits.cast.length]);

  useEffect(() => {
    logRouteLayoutMeta(LAYOUT_SCOPE, route, {
      shell: 'none',
      renderer: activeTab === 'cast' ? 'FlatList' : 'SectionList',
      itemComponent: activeTab === 'cast' ? 'CreditCastRow' : 'CreditCrewRow',
      dataCount: activeTab === 'cast' ? credits.cast.length : credits.crew.length,
      headerPlacement: 'ListHeaderComponent',
      nestedInStackListScreen: false,
    });
  }, [activeTab, credits.cast.length, credits.crew.length, route]);

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
    <View onLayout={routeLayoutHandler(LAYOUT_SCOPE, 'header', route)}>
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
        renderItem={({ item, index }) => {
          if (__DEV__ && index === 0) {
            logRouteLayoutMeta(LAYOUT_SCOPE, route, {
              renderItemIndex0: true,
              itemComponent: 'CreditCastRow',
              itemId: item.providerPersonId ?? item.name,
            });
          }

          return (
            <View
              collapsable={false}
              onLayout={
                index === 0
                  ? routeLayoutHandler(LAYOUT_SCOPE, 'item:index0', route, {
                      itemComponent: 'CreditCastRow',
                    })
                  : undefined
              }
            >
              <CreditCastRow member={item} contentType={contentType} onPress={handleCastPress} />
            </View>
          );
        }}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onLayout={(event) => {
          onCastRootLayout(event);
          routeLayoutHandler(LAYOUT_SCOPE, 'list', route, {
            renderer: 'FlatList',
            dataCount: credits.cast.length,
          })(event);
        }}
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
