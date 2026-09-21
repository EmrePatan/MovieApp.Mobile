import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';
import { renderStreamingResultRow } from '@/features/search/utils/render-streaming-result-row';
import type { SearchResultItem } from '@/features/search/types';

const route = {
  pathname: '/streaming-discover',
  segments: ['streaming-discover'],
};

const item: SearchResultItem = {
  id: 'movie-1',
  type: 'movie',
  title: 'Inception',
  originalTitle: 'Inception',
  overview: 'A thief who steals secrets.',
  posterUrl: null,
  backdropUrl: null,
  releaseDate: '2010-07-16',
  voteAverage: 8.8,
  voteCount: 100,
  year: 2010,
};

describe('renderStreamingResultRow', () => {
  it('renders the DEV A/B control stack for the first streaming result row', () => {
    render(
      <View>
        {renderStreamingResultRow({
          route,
          item,
          index: 0,
          onPress: jest.fn(),
        })}
      </View>,
    );

    expect(screen.getByText('RESULT CONTROL')).toBeTruthy();
    expect(screen.getAllByText('Inception').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByLabelText('Inception, Movie · 2010 · ★ 8.8')).toBeTruthy();
  });
});
