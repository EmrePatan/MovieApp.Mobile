import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/common/AppText';
import { ErrorView } from '@/components/common/ErrorView';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';
import type { DiscoveryWatchProvider } from '../watch-provider-types';
import { WatchProviderLogo } from './WatchProviderLogo';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { watchProviderLogoSize } from './WatchProviderLogo';

interface WatchProviderSelectorProps {
  providers: DiscoveryWatchProvider[];
  selectedProviderIds: number[];
  isLoading: boolean;
  isError: boolean;
  onToggle: (providerId: number) => void;
  onRetry?: () => void;
}

export function WatchProviderSelector({
  providers,
  selectedProviderIds,
  isLoading,
  isError,
  onToggle,
  onRetry,
}: WatchProviderSelectorProps) {
  if (isLoading) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {Array.from({ length: 5 }, (_, index) => (
          <View key={index} style={styles.providerItem}>
            <SkeletonBlock width={watchProviderLogoSize} height={watchProviderLogoSize} />
            <SkeletonBlock width={watchProviderLogoSize} height={10} />
          </View>
        ))}
      </ScrollView>
    );
  }

  if (isError) {
    return (
      <ErrorView
        message="Unable to load streaming providers."
        onRetry={onRetry}
        retryLabel="Try Again"
      />
    );
  }

  if (providers.length === 0) {
    return (
      <AppText variant="bodySmall" muted>
        No streaming providers are available right now.
      </AppText>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
      {providers.map((provider) => {
        const selected = selectedProviderIds.includes(provider.providerId);

        return (
          <Pressable
            key={provider.providerId}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={provider.name}
            onPress={() => onToggle(provider.providerId)}
            style={styles.providerItem}
            testID={`discovery-provider-${provider.providerId}`}
          >
            <WatchProviderLogo provider={provider} selected={selected} />
            <AppText variant="caption" style={styles.providerName} numberOfLines={2}>
              {provider.name}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  providerItem: {
    width: 72,
    alignItems: 'center',
    gap: spacing.xs,
  },
  providerName: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
});
