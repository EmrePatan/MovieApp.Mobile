import { fireEvent, render, screen } from '@testing-library/react-native';
import { SearchBar } from '@/features/search/components/SearchBar';
import { SearchEmptyState } from '@/features/search/components/SearchEmptyState';
import { SearchFilterControl } from '@/features/search/components/SearchFilterControl';
import { SearchResultCard } from '@/features/search/components/SearchResultCard';
import type { SearchResultItem } from '@/features/search/types';

describe('search UI components', () => {
  it('renders search bar and submits query', () => {
    const onSubmit = jest.fn();
    const onClear = jest.fn();

    render(
      <SearchBar
        value="interstellar"
        onChangeText={jest.fn()}
        onSubmit={onSubmit}
        onClear={onClear}
      />,
    );

    fireEvent(screen.getByLabelText('Search movies and TV shows'), 'submitEditing');
    expect(onSubmit).toHaveBeenCalled();

    fireEvent.press(screen.getByLabelText('Clear search'));
    expect(onClear).toHaveBeenCalled();
  });

  it('renders filter control', () => {
    const onChange = jest.fn();
    render(<SearchFilterControl value="all" onChange={onChange} />);
    fireEvent.press(screen.getByLabelText('Filter Movies'));
    expect(onChange).toHaveBeenCalledWith('movie');
  });

  it('renders empty state', () => {
    render(
      <SearchEmptyState
        title="Search for a movie or TV show"
        message="Find titles across the catalog."
      />,
    );

    expect(screen.getByText('Search for a movie or TV show')).toBeTruthy();
  });

  it('renders result card with movie badge', () => {
    const item: SearchResultItem = {
      id: 'movie-id',
      type: 'movie',
      title: 'Interstellar',
      originalTitle: 'Interstellar',
      overview: 'A team travels through a wormhole.',
      posterUrl: null,
      backdropUrl: null,
      releaseDate: '2014-11-07',
      voteAverage: 8.4,
      voteCount: 1000,
      year: 2014,
    };

    const onPress = jest.fn();
    render(<SearchResultCard item={item} onPress={onPress} />);

    expect(screen.getByText('Interstellar')).toBeTruthy();
    expect(screen.getByText('Movie')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Interstellar, Movie, 2014, rating 8.4'));
    expect(onPress).toHaveBeenCalledWith(item);
  });
});
