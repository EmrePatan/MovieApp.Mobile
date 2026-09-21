import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { DiscoverRouteProbe } from '@/debug/discover-route-probe';
import type { SearchResultItem } from '@/features/search/types';

jest.mock('expo-router', () => ({
  usePathname: jest.fn(() => '/discover-browse'),
  useSegments: jest.fn(() => ['discover-browse']),
  useFocusEffect: (callback: () => void | (() => void)) => {
    const cleanup = callback();
    return cleanup;
  },
}));

const items: SearchResultItem[] = [
  {
    id: 'movie-1',
    type: 'movie',
    title: 'Alpha',
    originalTitle: 'Alpha',
    overview: '',
    posterUrl: null,
    backdropUrl: null,
    releaseDate: '2020-01-01',
    voteAverage: 7,
    voteCount: 1,
    year: 2020,
  },
];

describe('DiscoverRouteProbe', () => {
  it('renders the stage-0 plain route control', () => {
    render(
      <DiscoverRouteProbe
        stage={0}
        production={<Text>production</Text>}
        items={items}
        listHeader={<Text>header</Text>}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByTestId('discover-route-control')).toBeTruthy();
    expect(screen.getByText('DISCOVER ROUTE CONTROL')).toBeTruthy();
  });

  it('renders primitive FlatList rows at stage 2', () => {
    render(
      <DiscoverRouteProbe
        stage={2}
        production={<Text>production</Text>}
        items={items}
        listHeader={<Text>header</Text>}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByText('DISCOVER CONTROL 2')).toBeTruthy();
    expect(screen.getByText('ROW 1')).toBeTruthy();
  });

  it('renders real-data primitive FlatList rows at stage 3', () => {
    render(
      <DiscoverRouteProbe
        stage={3}
        production={<Text>production</Text>}
        items={items}
        listHeader={<Text>header</Text>}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByText('DISCOVER CONTROL 3')).toBeTruthy();
    expect(screen.getByText('0: Alpha (movie / movie-1)')).toBeTruthy();
  });

  it('renders SearchResultCard rows at stage 4 with the same FlatList host as stage 3', () => {
    render(
      <DiscoverRouteProbe
        stage={4}
        production={<Text>production</Text>}
        items={items}
        listHeader={<Text>header</Text>}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByText('DISCOVER CONTROL 4')).toBeTruthy();
    expect(screen.getByLabelText('Alpha, Movie · 2020 · ★ 7.0')).toBeTruthy();
    expect(screen.queryByText('header')).toBeNull();
  });

  it('passes through production at stage 5', () => {
    render(
      <DiscoverRouteProbe
        stage={5}
        production={<Text testID="production-screen">production</Text>}
        items={items}
        listHeader={<Text>header</Text>}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByTestId('production-screen')).toBeTruthy();
  });
});
