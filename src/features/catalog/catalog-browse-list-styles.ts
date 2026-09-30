import { StyleSheet } from 'react-native';
import { layout } from '@/theme/layout';
import { spacing } from '@/theme/spacing';

/**
 * Shared layout for vertical catalog browse / See All lists (discover-browse, world cinema, etc.).
 * Rows (`CatalogResultRow`) own horizontal inset; the list must not add extra horizontal padding.
 */
export const catalogBrowseListStyles = StyleSheet.create({
  topBar: {
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  listHeader: {
    paddingHorizontal: layout.screenPaddingHorizontal,
    paddingBottom: layout.catalogBrowseListHeader.paddingBottom,
  },
  listHeaderWithGap: {
    gap: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  title: {
    flex: 1,
  },
  listContent: {
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  listContentEmpty: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  emptyWithAction: {
    gap: spacing.md,
    alignItems: 'center',
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: layout.screenPaddingHorizontal,
  },
  footerLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
