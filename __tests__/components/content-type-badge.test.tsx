import { render, screen } from '@testing-library/react-native';
import { ContentTypeBadge } from '@/components/content/ContentTypeBadge';

describe('ContentTypeBadge', () => {
  it('renders movie and tv labels', () => {
    const { rerender } = render(<ContentTypeBadge type="movie" />);
    expect(screen.getByText('Movie')).toBeTruthy();

    rerender(<ContentTypeBadge type="tv" />);
    expect(screen.getByText('TV')).toBeTruthy();
  });
});
