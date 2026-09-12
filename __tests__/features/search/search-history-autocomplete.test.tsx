import { fireEvent, render, screen } from '@testing-library/react-native';
import { SearchHistorySection } from '@/features/search/components/SearchHistorySection';
import { SearchSuggestionList } from '@/features/search/components/SearchSuggestionList';

describe('search history and autocomplete UI', () => {
  it('renders empty history state', () => {
    render(
      <SearchHistorySection
        items={[]}
        isLoading={false}
        isError={false}
        isClearing={false}
        deletingId={null}
        onSelect={jest.fn()}
        onDelete={jest.fn()}
        onClearAll={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByText('Your recent searches will appear here.')).toBeTruthy();
  });

  it('selects a history item', () => {
    const onSelect = jest.fn();

    render(
      <SearchHistorySection
        items={[
          {
            id: 'history-1',
            query: 'interstellar',
            searchedAt: '2026-09-11T14:30:00Z',
          },
        ]}
        isLoading={false}
        isError={false}
        isClearing={false}
        deletingId={null}
        onSelect={onSelect}
        onDelete={jest.fn()}
        onClearAll={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByLabelText('Search for interstellar'));
    expect(onSelect).toHaveBeenCalledWith('interstellar');
  });

  it('deletes a history item', () => {
    const onDelete = jest.fn();

    render(
      <SearchHistorySection
        items={[
          {
            id: 'history-1',
            query: 'breaking bad',
            searchedAt: '2026-09-11T14:30:00Z',
          },
        ]}
        isLoading={false}
        isError={false}
        isClearing={false}
        deletingId={null}
        onSelect={jest.fn()}
        onDelete={onDelete}
        onClearAll={jest.fn()}
        onRetry={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByLabelText('Delete breaking bad from history'));
    expect(onDelete).toHaveBeenCalledWith('history-1');
  });

  it('selects an autocomplete suggestion', () => {
    const onSelect = jest.fn();

    render(
      <SearchSuggestionList
        suggestions={[
          { id: '1', type: 'movie', title: 'Interstellar' },
        ]}
        isLoading={false}
        onSelect={onSelect}
      />,
    );

    fireEvent.press(screen.getByLabelText('Search for Interstellar, Movie'));
    expect(onSelect).toHaveBeenCalledWith({
      id: '1',
      type: 'movie',
      title: 'Interstellar',
    });
  });
});
