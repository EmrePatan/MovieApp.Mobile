import { fireEvent, render, screen } from '@testing-library/react-native';
import { SearchHistorySection } from '@/features/search/components/SearchHistorySection';
import { SearchSuggestionList } from '@/features/search/components/SearchSuggestionList';

describe('search history and autocomplete UI', () => {
  it('renders nothing when history is empty', () => {
    const { toJSON } = render(
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

    expect(toJSON()).toBeNull();
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
          { id: '1', type: 'movie', title: 'Interstellar', posterUrl: null },
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
      posterUrl: null,
    });
  });

  it('renders a movie-specific leading visual', () => {
    render(
      <SearchSuggestionList
        suggestions={[{ id: '1', type: 'movie', title: 'Interstellar', posterUrl: null }]}
        isLoading={false}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Movie suggestion')).toBeTruthy();
  });

  it('renders a TV-specific leading visual', () => {
    render(
      <SearchSuggestionList
        suggestions={[{ id: '2', type: 'tv', title: 'Breaking Bad', posterUrl: null }]}
        isLoading={false}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('TV show suggestion')).toBeTruthy();
  });

  it('renders a poster thumbnail when poster data is present', () => {
    render(
      <SearchSuggestionList
        suggestions={[
          {
            id: '1',
            type: 'movie',
            title: 'Interstellar',
            posterUrl: 'https://image.tmdb.org/t/p/w92/interstellar.jpg',
          },
        ]}
        isLoading={false}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Interstellar poster')).toBeTruthy();
    expect(screen.queryByLabelText('Movie suggestion')).toBeNull();
  });

  it('falls back to a type icon when poster data is unavailable', () => {
    render(
      <SearchSuggestionList
        suggestions={[
          { id: '1', type: 'movie', title: 'Interstellar', posterUrl: null },
        ]}
        isLoading={false}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Movie suggestion')).toBeTruthy();
    expect(screen.queryByLabelText('Interstellar poster')).toBeNull();
  });

  it('shows a minimal empty state when autocomplete has no matches', () => {
    render(
      <SearchSuggestionList suggestions={[]} isLoading={false} onSelect={jest.fn()} />,
    );

    expect(screen.getByLabelText('No suggestions')).toBeTruthy();
    expect(screen.getByText('No suggestions')).toBeTruthy();
  });

  it('shows a lightweight autocomplete loading state', () => {
    render(
      <SearchSuggestionList
        suggestions={[]}
        isLoading
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Loading suggestions')).toBeTruthy();
  });
});
