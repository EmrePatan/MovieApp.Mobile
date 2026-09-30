import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { CatalogKeywordSelectorPanel } from '@/features/catalog/components/CatalogKeywordSelector';
import { initI18nForTests } from '../../i18n/i18n-test-utils';

const KEYWORD_ID = 'kw-time-travel';

jest.mock('@/features/discovery/hooks/useDiscoveryKeywords', () => ({
  useDiscoveryKeywords: () => ({
    data: {
      items: [{ id: KEYWORD_ID, name: 'time travel' }],
    },
    isLoading: false,
    isError: false,
  }),
}));

describe('CatalogKeywordSelectorPanel', () => {
  beforeEach(async () => {
    await initI18nForTests('en');
  });

  it('selects exactly one canonical keyword when one search result is tapped once', () => {
    const onChange = jest.fn();

    render(
      <CatalogKeywordSelectorPanel
        active
        selectedIds={[]}
        selectedLabels={{}}
        onChange={onChange}
        testID="keyword-panel"
      />,
    );

    fireEvent.press(screen.getByLabelText('time travel'));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith({
      ids: [KEYWORD_ID],
      labels: { [KEYWORD_ID]: 'time travel' },
    });
  });

  it('dedupes duplicate selected ids and deselects the single canonical keyword', () => {
    const onChange = jest.fn();

    render(
      <CatalogKeywordSelectorPanel
        active
        selectedIds={[KEYWORD_ID, KEYWORD_ID]}
        selectedLabels={{ [KEYWORD_ID]: 'time travel' }}
        onChange={onChange}
        testID="keyword-panel"
      />,
    );

    expect(screen.getAllByLabelText('time travel')).toHaveLength(1);

    fireEvent.press(screen.getByLabelText('time travel'));

    expect(onChange).toHaveBeenCalledWith({
      ids: [],
      labels: {},
    });
  });
});
