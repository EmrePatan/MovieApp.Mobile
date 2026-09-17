import { fireEvent, render, screen } from '@testing-library/react-native';
import { GlobalSearchEntry } from '@/features/navigation/components/GlobalSearchEntry';
import { openSearch } from '@/features/navigation/search-navigation';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/features/navigation/search-navigation', () => ({
  openSearch: jest.fn(),
}));

describe('GlobalSearchEntry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('navigates to search from the default entry', () => {
    render(<GlobalSearchEntry origin="home" />);

    fireEvent.press(screen.getByTestId('global-search-entry'));

    expect(openSearch).toHaveBeenCalledWith(expect.anything(), 'home');
    expect(screen.getByText('Search movies, TV & people')).toBeTruthy();
    expect(screen.getByLabelText('Search movies, TV shows, and people')).toBeTruthy();
  });

  it('renders the premium discover search surface and navigates to search', () => {
    render(<GlobalSearchEntry origin="discover" variant="discover" />);

    expect(screen.getByTestId('discover-search-entry')).toBeTruthy();
    expect(screen.getByText('Search movies, shows & people')).toBeTruthy();
    expect(screen.getByLabelText('Search movies, TV shows, and people')).toBeTruthy();

    fireEvent.press(screen.getByTestId('discover-search-entry'));

    expect(openSearch).toHaveBeenCalledWith(expect.anything(), 'discover');
  });
});
