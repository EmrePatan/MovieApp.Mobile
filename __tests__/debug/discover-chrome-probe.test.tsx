import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';
import { DiscoverChromeProbe } from '@/debug/discover-chrome-probe';
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

describe('DiscoverChromeProbe', () => {
  const baseProps = {
    items,
    onPress: jest.fn(),
    headerShell: <Text testID="header-shell">shell</Text>,
    headerWithTitle: <Text testID="header-title">title</Text>,
    headerFull: <Text testID="header-full">full</Text>,
    listEmptyComponent: <Text testID="empty">empty</Text>,
    listFooter: <Text testID="footer">footer</Text>,
    contentContainerStyle: { paddingBottom: 32 },
    emptyContentContainerStyle: { flexGrow: 1 },
    refreshControl: undefined,
    onEndReached: jest.fn(),
    initialNumToRender: 3,
    maxToRenderPerBatch: 2,
    windowSize: 5,
    productionScreen: <Text testID="production-screen">production</Text>,
  };

  it('renders stage 4A with header shell and SearchResultCard rows', () => {
    render(<DiscoverChromeProbe stage="4A" {...baseProps} />);

    expect(screen.getByText('DISCOVER 4A')).toBeTruthy();
    expect(screen.getByTestId('header-shell')).toBeTruthy();
    expect(screen.getByLabelText('Alpha, Movie · 2020 · ★ 7.0')).toBeTruthy();
  });

  it('passes through full production at stage 4E', () => {
    render(<DiscoverChromeProbe stage="4E" {...baseProps} />);

    expect(screen.getByTestId('production-screen')).toBeTruthy();
  });
});
