import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { CatalogDiscoveryFilterSheet } from '@/features/discovery/components/CatalogDiscoveryFilterSheet';
import { BROWSE_FILTER_SHEET_CONFIG } from '@/features/discovery/utils/browse-filter-adapters';
import { createEmptyCatalogFilterDraft } from '@/features/discovery/utils/catalog-filter-draft';
import { initI18nForTests } from '../../i18n/i18n-test-utils';

jest.mock('@/features/discovery/hooks/useGenres', () => ({
  useGenres: () => ({
    data: [{ id: 'genre-1', name: 'Action' }],
    isLoading: false,
  }),
}));

jest.mock('@/features/discovery/hooks/useDiscoveryKeywords', () => ({
  useDiscoveryKeywords: () => ({ data: { items: [] }, isLoading: false, isError: false }),
}));

describe('CatalogDiscoveryFilterSheet drill-down', () => {
  beforeEach(async () => {
    await initI18nForTests('en');
  });

  it('opens genre selector inside the same filter sheet without a nested modal', () => {
    const onApply = jest.fn();

    render(
      <CatalogDiscoveryFilterSheet
        visible
        draft={createEmptyCatalogFilterDraft()}
        config={BROWSE_FILTER_SHEET_CONFIG}
        onClose={jest.fn()}
        onApply={onApply}
        onReset={jest.fn()}
        testID="catalog-filter-sheet"
      />,
    );

    fireEvent.press(screen.getByLabelText('Genre, Any'));
    expect(screen.getByTestId('catalog-genre-selector')).toBeTruthy();
    expect(screen.getByLabelText('Action')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Action'));
    fireEvent.press(screen.getByTestId('catalog-filter-sheet-header-action'));
    fireEvent.press(screen.getByText('Show Results'));

    expect(onApply).toHaveBeenCalledWith(
      expect.objectContaining({
        genreIds: ['genre-1'],
      }),
    );
  });

  it('shows selected minimum vote count summary after drill-down', () => {
    render(
      <CatalogDiscoveryFilterSheet
        visible
        draft={createEmptyCatalogFilterDraft()}
        config={BROWSE_FILTER_SHEET_CONFIG}
        onClose={jest.fn()}
        onApply={jest.fn()}
        onReset={jest.fn()}
        testID="catalog-filter-sheet"
      />,
    );

    fireEvent.press(screen.getByLabelText('Minimum Vote Count, Any'));
    fireEvent.press(screen.getByLabelText('500+'));
    fireEvent.press(screen.getByTestId('catalog-filter-sheet-header-action'));

    expect(screen.getByLabelText('Minimum Vote Count, 500+')).toBeTruthy();
  });

  it('shows the applied vote count as selected in the drill-down', () => {
    render(
      <CatalogDiscoveryFilterSheet
        visible
        draft={{
          ...createEmptyCatalogFilterDraft(),
          minVoteCount: 5000,
        }}
        config={BROWSE_FILTER_SHEET_CONFIG}
        onClose={jest.fn()}
        onApply={jest.fn()}
        onReset={jest.fn()}
        testID="catalog-filter-sheet"
      />,
    );

    fireEvent.press(screen.getByLabelText('Minimum Vote Count, 5000+'));

    const selectedOption = screen.getByLabelText('5000+');
    expect(selectedOption.props.accessibilityState?.selected).toBe(true);
  });
});
