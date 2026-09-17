import { fireEvent, render, screen } from '@testing-library/react-native';
import { WorldCinemaHubSection } from '@/features/discover/components/WorldCinemaHubSection';
import { useWorldCinemaPreview } from '@/features/discovery/hooks/useWorldCinemaPreview';
import { countryCodeToFlagEmoji } from '@/features/discovery/utils/country-flag';
import { WORLD_CINEMA_CURATED_COLLECTIONS } from '@/features/discovery/world-cinema-collections';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({}),
}));

jest.mock('@/features/discovery/hooks/useWorldCinemaPreview', () => ({
  useWorldCinemaPreview: jest.fn(),
}));

describe('WorldCinemaHubSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useWorldCinemaPreview as jest.Mock).mockReturnValue({
      data: {
        items: [
          {
            id: 'movie-1',
            type: 'movie',
            title: 'Parasite',
            posterUrl: '/poster.jpg',
          },
        ],
      },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });
  });

  it('renders concise country tabs with flags', () => {
    render(<WorldCinemaHubSection />);

    expect(screen.getByText('World Cinema')).toBeTruthy();
    expect(screen.getByText('Korean')).toBeTruthy();
    expect(screen.getByText('Japanese')).toBeTruthy();
    expect(screen.getByText(countryCodeToFlagEmoji('KR'))).toBeTruthy();
    expect(screen.queryByText('Korean Cinema')).toBeNull();
    expect(screen.queryByText('Japanese Cinema')).toBeNull();
  });

  it('does not repeat the selected country as a preview heading', () => {
    render(<WorldCinemaHubSection />);

    expect(screen.getByTestId('world-cinema-preview')).toBeTruthy();
    expect(screen.getByText('Parasite')).toBeTruthy();
    expect(screen.queryByText('Korean')).toBeTruthy();
    expect(screen.queryAllByText('Korean')).toHaveLength(1);
  });

  it('switches preview country when a tab is selected', () => {
    render(<WorldCinemaHubSection />);

    fireEvent.press(screen.getByTestId('world-cinema-chip-JP'));

    expect(useWorldCinemaPreview).toHaveBeenLastCalledWith('JP', 'movie');
  });

  it('renders supported curated country tabs', () => {
    render(<WorldCinemaHubSection />);

    expect(WORLD_CINEMA_CURATED_COLLECTIONS).toHaveLength(15);
    expect(screen.getByTestId('world-cinema-chip-KR')).toBeTruthy();
    expect(screen.getByTestId('world-cinema-chip-JP')).toBeTruthy();
    expect(screen.getByTestId('world-cinema-chip-FR')).toBeTruthy();
  });

  it('shows empty state without introducing extra requests', () => {
    (useWorldCinemaPreview as jest.Mock).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
      refetch: jest.fn(),
    });

    render(<WorldCinemaHubSection />);

    expect(
      screen.getByText('No titles found for this cinema collection right now.'),
    ).toBeTruthy();
    expect(useWorldCinemaPreview).toHaveBeenCalledTimes(1);
  });
});
