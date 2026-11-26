import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppButton } from '@/components/buttons/AppButton';
import { catalogBrowseListStyles } from '@/features/catalog/catalog-browse-list-styles';
import { SearchEmptyState } from '@/features/search/components/SearchEmptyState';

interface CatalogEmptyStateProps {
  /** True when user filters are applied, so clearing them can bring results back. */
  filtered: boolean;
  onClearFilters: () => void;
  /** Shown when nothing is filtered. */
  title: string;
  message?: string;
}

/** Empty result state shared by every discover list. */
export function CatalogEmptyState({
  filtered,
  onClearFilters,
  title,
  message,
}: CatalogEmptyStateProps) {
  const { t } = useTranslation();

  if (!filtered) {
    return <SearchEmptyState title={title} message={message} />;
  }

  return (
    <View style={catalogBrowseListStyles.emptyWithAction}>
      <SearchEmptyState
        title={t('discovery.browseScreen.noTitlesMatchFiltersTitle')}
        message={t('discovery.browseScreen.noTitlesMatchFiltersMessage')}
      />
      <AppButton title={t('common.clearFilters')} variant="secondary" onPress={onClearFilters} />
    </View>
  );
}
