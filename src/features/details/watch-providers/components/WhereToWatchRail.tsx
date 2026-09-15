import { Image, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { HomeSectionHeader } from '@/features/home/components/HomeSectionHeader';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import { getCatalogDetailWatchRegion } from '@/features/details/shared/navigation/catalog-detail-navigation';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { resolveImageUri } from '@/utils/image-url';
import { useMovieWatchProviders, useTvShowWatchProviders } from '../hooks/useWatchProviders';
import { colors } from '@/theme/colors';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

const PROVIDER_LOGO_SIZE = 54;

interface WhereToWatchRailProps {
  contentType: 'movie' | 'tv';
  contentId: string;
  region?: string;
}

export function WhereToWatchRail({
  contentType,
  contentId,
  region,
}: WhereToWatchRailProps) {
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
        <HomeSectionHeader title="Where to Watch" />
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

  const providers = query.data.providers;

  return (
    <View style={styles.container} testID="where-to-watch-rail">
      <HomeSectionHeader title="Where to Watch" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {providers.map((provider) => {
          const logoUri = resolveImageUri(provider.logoPath);

          return (
          <View
            key={provider.providerId}
            style={styles.providerItem}
            accessibilityRole="text"
            accessibilityLabel={provider.name}
            testID={`watch-provider-${provider.providerId}`}
          >
            <View style={styles.logoCircle}>
              {logoUri ? (
                <Image
                  source={{ uri: logoUri }}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.logoFallback}>
                  <AppText variant="caption" style={styles.logoFallbackText}>
                    {provider.name.charAt(0)}
                  </AppText>
                </View>
              )}
            </View>
            <AppText variant="caption" style={styles.providerName} numberOfLines={2}>
              {provider.name}
            </AppText>
          </View>
          );
        })}
      </ScrollView>
      <AppText variant="caption" style={styles.attribution} testID="where-to-watch-attribution">
        Data provided by JustWatch
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
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
  logoImage: {
    width: PROVIDER_LOGO_SIZE,
    height: PROVIDER_LOGO_SIZE,
  },
  logoFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  logoFallbackText: {
    color: colors.textMuted,
    fontWeight: '600',
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
