import { fireEvent, screen } from '@testing-library/react-native';
import { renderWithProviders as render } from '../../utils/render-with-providers';
import { ReviewCard } from '@/features/reviews/components/ReviewCard';
import type { ReviewResponse } from '@/features/reviews/types';

jest.mock('@/features/reviews/components/ReviewTranslationControls', () => {
  const React = require('react');
  const { Text: NativeText } = require('react-native');
  return {
    ReviewTranslationControls: ({ review }: { review: { content: string } }) =>
      React.createElement(NativeText, null, review.content),
  };
});

const spoilerReview: ReviewResponse = {
  id: 'r1',
  user: { id: 'u1', displayName: 'Jane Doe' },
  content: '[spoiler]Katil kardeşmiş',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

describe('review spoiler gate', () => {
  it('hides spoiler text from other users until revealed', () => {
    render(<ReviewCard review={spoilerReview} />);

    expect(screen.getByTestId('spoiler-gate')).toBeTruthy();
    expect(screen.queryByText(/Katil/)).toBeNull();

    fireEvent.press(screen.getByTestId('spoiler-gate'));
    expect(screen.queryByTestId('spoiler-gate')).toBeNull();
  });

  it('shows the author their own spoiler review without the gate', () => {
    render(<ReviewCard review={spoilerReview} isOwnReview />);

    expect(screen.queryByTestId('spoiler-gate')).toBeNull();
    expect(screen.getByText(/Katil/)).toBeTruthy();
  });
});
