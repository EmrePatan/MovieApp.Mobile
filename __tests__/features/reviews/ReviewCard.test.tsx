import { render } from '@testing-library/react-native';
import { Image } from 'react-native';
import { ReviewCard } from '@/features/reviews/components/ReviewCard';
import type { ReviewResponse } from '@/features/reviews/types';

jest.mock('@/features/reviews/components/ReviewTranslationControls', () => ({
  ReviewTranslationControls: () => null,
}));

const review: ReviewResponse = {
  id: 'review-1',
  content: 'Great film',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
  user: {
    id: 'author-1',
    displayName: 'Reviewer',
    effectiveAvatarUrl: 'https://cdn.example.com/review-author.webp',
  },
};

describe('ReviewCard', () => {
  it('passes review author effectiveAvatarUrl to UserAvatar', () => {
    const screen = render(<ReviewCard review={review} />);
    const image = screen.UNSAFE_getByType(Image);
    expect(image.props.source).toEqual({ uri: 'https://cdn.example.com/review-author.webp' });
  });
});
