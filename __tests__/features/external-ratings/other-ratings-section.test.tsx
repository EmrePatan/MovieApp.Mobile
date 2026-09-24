import { render } from '@testing-library/react-native';
import { OtherRatingsSection } from '@/features/external-ratings/components/OtherRatingsSection';

const mockUseExternalRatings = jest.fn();

jest.mock('@/features/external-ratings/hooks/useExternalRatings', () => ({
  useExternalRatings: (...args: unknown[]) => mockUseExternalRatings(...args),
}));

describe('OtherRatingsSection', () => {
  const contentId = '65de321a-597a-46ec-a499-67ad9e20795e';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows skeleton while loading without cached data', () => {
    mockUseExternalRatings.mockReturnValue({
      isLoading: true,
      data: undefined,
      isError: false,
    });

    const screen = render(<OtherRatingsSection mediaType="movie" contentId={contentId} />);
    expect(screen.getByTestId('other-ratings-loading')).toBeTruthy();
  });

  it('hides the section when ratings are empty', () => {
    mockUseExternalRatings.mockReturnValue({
      isLoading: false,
      data: { ratings: [] },
      isError: false,
    });

    const screen = render(<OtherRatingsSection mediaType="movie" contentId={contentId} />);
    expect(screen.queryByTestId('other-ratings-section')).toBeNull();
  });

  it('renders cards when ratings exist', () => {
    mockUseExternalRatings.mockReturnValue({
      isLoading: false,
      data: {
        ratings: [
          { source: 'imdb', value: 8.4, scale: 10 },
          { source: 'letterboxd', value: 4.2, scale: 5 },
        ],
      },
      isError: false,
    });

    const screen = render(<OtherRatingsSection mediaType="tv" contentId={contentId} />);
    expect(screen.getByTestId('other-ratings-section')).toBeTruthy();
    expect(screen.getByText('8.4 / 10')).toBeTruthy();
    expect(screen.getByText('4.2 / 5')).toBeTruthy();
  });

  it('renders rotten tomatoes scores beside their icons', () => {
    mockUseExternalRatings.mockReturnValue({
      isLoading: false,
      data: {
        ratings: [
          { source: 'tomatometer', value: 89, scale: 100 },
          { source: 'popcornmeter', value: 90, scale: 100 },
        ],
      },
      isError: false,
    });

    const screen = render(<OtherRatingsSection mediaType="movie" contentId={contentId} />);
    expect(screen.getByTestId('external-rating-card-rotten-tomatoes')).toBeTruthy();
    expect(screen.getByText('89%', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByText('90%', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText('89% · 90%')).toBeNull();
  });
});
