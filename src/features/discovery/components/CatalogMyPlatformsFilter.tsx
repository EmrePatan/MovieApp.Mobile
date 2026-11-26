import { MyPlatformsFilter } from '@/features/watch-platforms/MyPlatformsFilter';
import { useRegionalPreference } from '@/features/regions/hooks/useRegionalPreference';
import { useDiscoveryWatchProviders } from '../hooks/useDiscoveryWatchProviders';
import type { CatalogContentType } from '../utils/catalog-filter-draft';

interface CatalogMyPlatformsFilterProps {
  contentType: CatalogContentType;
  selectedProviderIds: number[];
  onChange: (providerIds: number[]) => void;
  onChoose: () => void;
}

/** "Only on my platforms" for lists that can mix movies and TV. */
export function CatalogMyPlatformsFilter({
  contentType,
  ...filterProps
}: CatalogMyPlatformsFilterProps) {
  const { region, isHydrated } = useRegionalPreference();
  const movieProviders = useDiscoveryWatchProviders('movie', region, isHydrated);
  const tvProviders = useDiscoveryWatchProviders('tv', region, isHydrated);

  const movie = movieProviders.data?.providers;
  const tv = tvProviders.data?.providers;
  const available =
    contentType === 'movie' ? movie : contentType === 'tv' ? tv : movie && tv && [...movie, ...tv];

  return <MyPlatformsFilter {...filterProps} availableProviders={available} isOnlyPlatformControl />;
}
