import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { SearchMappedResultsScroll } from '@/features/search/components/SearchMappedResultsScroll';
import type { SearchResultItem } from '@/features/search/types';

jest.mock('expo-router', () => ({
  useSegments: jest.fn(() => ['search']),
  usePathname: jest.fn(() => '/search'),
}));

const items: SearchResultItem[] = [
  {
    id: 'movie-1',
    type: 'movie',
    title: 'Alpha',
    originalTitle: 'Alpha',
    overview: 'First result.',
    posterUrl: null,
    backdropUrl: null,
    releaseDate: '2020-01-01',
    voteAverage: 7.5,
    voteCount: 10,
    year: 2020,
  },
  {
    id: 'movie-2',
    type: 'movie',
    title: 'Beta',
    originalTitle: 'Beta',
    overview: 'Second result.',
    posterUrl: null,
    backdropUrl: null,
    releaseDate: '2021-01-01',
    voteAverage: 8.1,
    voteCount: 20,
    year: 2021,
  },
];

describe('SearchMappedResultsScroll', () => {
  it('inserts renderRow return values into the committed tree for every item', () => {
    const renderRow = jest.fn(({ item }: { item: SearchResultItem }) => (
      <Text testID={`row-${item.id}`}>{item.title}</Text>
    ));

    render(
      <SearchMappedResultsScroll
        layoutScope="search"
        testID="search-results-scroll"
        items={items}
        keyExtractor={(item) => item.id}
        onPress={jest.fn()}
        renderRow={renderRow}
      />,
    );

    expect(renderRow).toHaveBeenCalledTimes(2);
    expect(screen.getByTestId('row-movie-1')).toBeTruthy();
    expect(screen.getByTestId('row-movie-2')).toBeTruthy();
    expect(screen.getByText('Alpha')).toBeTruthy();
    expect(screen.getByText('Beta')).toBeTruthy();
  });

  it('renders SearchResultCard nodes for the default row renderer', () => {
    render(
      <SearchMappedResultsScroll
        layoutScope="search"
        testID="search-results-scroll"
        items={items}
        keyExtractor={(item) => item.id}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('Alpha, Movie · 2020 · ★ 7.5')).toBeTruthy();
    expect(screen.getByLabelText('Beta, Movie · 2021 · ★ 8.1')).toBeTruthy();
  });

  it('keeps the ScrollView host in the tree when rows are mapped', () => {
    render(
      <SearchMappedResultsScroll
        layoutScope="search"
        testID="search-results-scroll"
        items={items}
        keyExtractor={(item) => item.id}
        onPress={jest.fn()}
        renderRow={({ item }) => <Text testID={`row-${item.id}`}>{item.title}</Text>}
      />,
    );

    expect(screen.getByTestId('search-results-scroll')).toBeTruthy();
  });
});
