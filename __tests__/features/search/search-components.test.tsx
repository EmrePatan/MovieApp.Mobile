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

    fireEvent(screen.getByLabelText('Search movies, TV shows, and people'), 'submitEditing');
    expect(onSubmit).toHaveBeenCalled();

    fireEvent.press(screen.getByLabelText('Clear search'));
    expect(onClear).toHaveBeenCalled();
  });

  it('renders filter control', () => {
    const onChange = jest.fn();
    render(<SearchFilterControl value="all" onChange={onChange} />);
    fireEvent.press(screen.getByLabelText('Filter Movies'));
    expect(onChange).toHaveBeenCalledWith('movie');
    fireEvent.press(screen.getByLabelText('Filter People'));
    expect(onChange).toHaveBeenCalledWith('person');
  });

  it('renders empty state', () => {
    render(
      <SearchEmptyState
        title="Search movies and TV shows"
        message="Try a title like Inception or Breaking Bad"
      />,
    );

    expect(screen.getByText('Search movies and TV shows')).toBeTruthy();
    expect(screen.getByText('Try a title like Inception or Breaking Bad')).toBeTruthy();
  });

  it('renders result card with compact metadata', () => {
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
    expect(screen.getByText('Movie · 2014 · ★ 8.4')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Interstellar, Movie · 2014 · ★ 8.4'));
    expect(onPress).toHaveBeenCalledWith(item);
  });

  it('renders person result card with department metadata', () => {
    const item: SearchResultItem = {
      id: 'person-id',
      type: 'person',
      title: 'Leonardo DiCaprio',
      tmdbId: 6193,
      knownForDepartment: 'Acting',
      posterUrl: null,
    };

    const onPress = jest.fn();
    render(<SearchResultCard item={item} onPress={onPress} />);

    expect(screen.getByText('Leonardo DiCaprio')).toBeTruthy();
    expect(screen.getByText('Person · Acting')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Leonardo DiCaprio, Person · Acting'));
    expect(onPress).toHaveBeenCalledWith(item);
  });
});
