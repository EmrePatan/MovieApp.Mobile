import { render, screen, fireEvent } from '@testing-library/react-native';
import { RecommendationCard } from '@/features/recommendations/components/RecommendationCard';
import type { RecommendationItem } from '@/features/recommendations/types';

const item: RecommendationItem = {
  id: 'movie-id',
  type: 'movie',
  title: 'Inception',
  originalTitle: 'Inception',
  overview: 'A dream within a dream.',
  posterUrl: '/poster.jpg',
  backdropUrl: null,
  releaseDate: '2010-07-16',
  voteAverage: 8.4,
  voteCount: 28000,
  year: 2010,
  score: 0.85,
  reason: 'Similar genres and cast',
};

describe('RecommendationCard', () => {
  it('renders title, type, year, rating, and reason', () => {
    render(<RecommendationCard item={item} />);

    expect(screen.getByText('Inception')).toBeTruthy();
    expect(screen.getByText('Movie · 2010 · ★ 8.4')).toBeTruthy();
    expect(screen.getByText('Similar genres and cast')).toBeTruthy();
  });

  it('hides reason when showReason is false', () => {
    render(<RecommendationCard item={item} showReason={false} />);

    expect(screen.getByText('Inception')).toBeTruthy();
    expect(screen.queryByText('Similar genres and cast')).toBeNull();
  });

  it('calls onPress', () => {
    const onPress = jest.fn();
    render(<RecommendationCard item={item} onPress={onPress} />);
    fireEvent.press(screen.getByText('Inception'));
    expect(onPress).toHaveBeenCalledWith(item);
  });
});
