import { render, screen } from '@testing-library/react-native';
import { StreamingBodyMountProbe } from '@/debug/streaming-body-mount-probe';
import type { SearchResultItem } from '@/features/search/types';

const firstItem: SearchResultItem = {
  id: 'movie-1',
  type: 'movie',
  title: 'Inception',
  originalTitle: 'Inception',
  overview: 'Dreams.',
  posterUrl: null,
  backdropUrl: null,
  releaseDate: '2010-07-16',
  voteAverage: 8.8,
  voteCount: 100,
  year: 2010,
};

describe('StreamingBodyMountProbe', () => {
  it('commits direct controls and staged scroll probes into the tree', () => {
    render(
      <StreamingBodyMountProbe firstItem={firstItem} onResultPress={jest.fn()} />,
    );

    expect(screen.getByTestId('direct-control-a')).toBeTruthy();
    expect(screen.getByTestId('direct-control-b')).toBeTruthy();
    expect(screen.getByTestId('direct-control-c')).toBeTruthy();
    expect(screen.getByText('DIRECT A')).toBeTruthy();
    expect(screen.getByText('DIRECT B')).toBeTruthy();
    expect(screen.getAllByText('Inception').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('SCROLL CHILD')).toBeTruthy();
    expect(screen.getByTestId('control-d-wrapper')).toBeTruthy();
    expect(screen.getByTestId('control-e-wrapper')).toBeTruthy();
    expect(screen.getByTestId('control-f-wrapper')).toBeTruthy();
    expect(screen.getByLabelText('Inception, Movie · 2010 · ★ 8.8')).toBeTruthy();
  });
});
