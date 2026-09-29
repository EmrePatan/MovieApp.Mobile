import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { ProviderLogoImage } from '@/components/common/ProviderLogoImage';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { getCatalogDetailWatchRegion } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { useMovieWatchProviders, useTvShowWatchProviders } from '../hooks/useWatchProviders';
import type { WatchProvider } from '../types';
import {
  groupWatchProvidersByMonetization,
  type WatchProviderMonetizationType,
} from '../utils/group-watch-providers-by-monetization';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const PROVIDER_LOGO_SIZE = 54;

const MONETIZATION_LABEL_KEYS: Record<WatchProviderMonetizationType, string> = {
  flatrate: 'details.watchProviders.groups.flatrate',
  free: 'details.watchProviders.groups.free',
  ads: 'details.watchProviders.groups.ads',
  rent: 'details.watchProviders.groups.rent',
  buy: 'details.watchProviders.groups.buy',
};

interface WhereToWatchRailProps {
  contentType: 'movie' | 'tv';
  contentId: string;
  region?: string;
}

function WatchProviderRow({
  providers,
  monetizationType,
}: {
  providers: WatchProvider[];
  monetizationType: WatchProviderMonetizationType;
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.group} testID={`where-to-watch-group-${monetizationType}`}>
      <AppText variant="caption" style={styles.groupLabel}>
        {t(MONETIZATION_LABEL_KEYS[monetizationType])}
      </AppText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {providers.map((provider) => (
          <View
            key={`${monetizationType}-${provider.providerId}`}
            style={styles.providerItem}
            accessibilityRole="text"
            accessibilityLabel={provider.name}
            testID={`watch-provider-${monetizationType}-${provider.providerId}`}
          >
            <View style={styles.logoCircle}>
              <ProviderLogoImage
                name={provider.name}
                logoPath={provider.logoPath}
                size={PROVIDER_LOGO_SIZE}
                testID={`watch-provider-logo-${monetizationType}-${provider.providerId}`}
              />
            </View>
            <AppText variant="caption" style={styles.providerName} numberOfLines={2}>
              {provider.name}
            </AppText>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

export function WhereToWatchRail({
  contentType,
  contentId,
  region,
}: WhereToWatchRailProps) {
  const { t } = useTranslation();
  const { region: userRegion, isHydrated } = useRegionalPreference();
  const contextualRegion = getCatalogDetailWatchRegion();
  const effectiveRegion = region ?? contextualRegion ?? userRegion;
  const canFetchProviders = region != null || contextualRegion != null || isHydrated;

  const movieQuery = useMovieWatchProviders(
    contentType === 'movie' ? contentId : '',
    effectiveRegion,
    canFetchProviders,
  );
  const tvQuery = useTvShowWatchProviders(
    contentType === 'tv' ? contentId : '',
    effectiveRegion,
    canFetchProviders,
  );
  const query = contentType === 'movie' ? movieQuery : tvQuery;

  if (query.isLoading) {
    return (
      <View style={styles.container} testID="where-to-watch-loading">
        <HomeSectionHeader title={t('details.sections.whereToWatch')} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        >
          {Array.from({ length: 5 }, (_, index) => (
            <View key={index} style={styles.providerItem}>
              <SkeletonBlock width={PROVIDER_LOGO_SIZE} height={PROVIDER_LOGO_SIZE} style={styles.logoSkeleton} />
              <SkeletonBlock width={PROVIDER_LOGO_SIZE} height={10} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  if (query.isError || !query.data?.providers?.length) {
    return null;
  }

  const groups = groupWatchProvidersByMonetization(query.data.providers);
  if (groups.length === 0) {
    return null;
  }

  return (
    <View style={styles.container} testID="where-to-watch-rail">
      <HomeSectionHeader title={t('details.sections.whereToWatch')} />
      {groups.map((group) => (
        <WatchProviderRow
          key={group.type}
          monetizationType={group.type}
          providers={group.providers}
        />
      ))}
      <AppText variant="caption" style={styles.attribution} testID="where-to-watch-attribution">
        {t('common.dataProvidedByJustWatch')}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  group: {
    marginBottom: spacing.sm,
  },
  groupLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xs,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    flexDirection: 'row',
    paddingRight: spacing.xl,
  },
  providerItem: {
    width: PROVIDER_LOGO_SIZE + 8,
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoCircle: {
    width: PROVIDER_LOGO_SIZE,
    height: PROVIDER_LOGO_SIZE,
    borderRadius: PROVIDER_LOGO_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  providerName: {
    color: colors.textSecondary,
    textAlign: 'center',
    fontSize: 11,
    lineHeight: 14,
  },
  attribution: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '400',
    textAlign: 'right',
    paddingHorizontal: layout.screenPaddingHorizontal,
    marginTop: spacing.sm,
  },
  logoSkeleton: {
    borderRadius: PROVIDER_LOGO_SIZE / 2,
  },
});
