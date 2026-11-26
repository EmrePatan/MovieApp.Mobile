import { fireEvent, render, screen } from '@testing-library/react-native';
import { useAuth } from '@/auth/useAuth';
import { MyPlatformsFilter } from '@/features/watch-platforms/MyPlatformsFilter';
import { buildPlatformOptions } from '@/features/watch-platforms/watch-platforms';
import { t } from '../../i18n/i18n-test-utils';

const mockPush = jest.fn();
let mockSavedIds: number[] = [];

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/auth/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: () => ({ data: { providerIds: mockSavedIds } }),
  useMutation: jest.fn(),
  useQueryClient: jest.fn(),
}));

const provider = (providerId: number, name: string, displayPriority = 0) => ({
  providerId,
  name,
  logoPath: null,
  displayPriority,
});

describe('buildPlatformOptions', () => {
  it('merges movie and TV catalogs in priority order', () => {
    const options = buildPlatformOptions(
      [
        [provider(119, 'Prime', 1), provider(8, 'Netflix', 0)],
        [provider(8, 'Netflix', 0), provider(337, 'Disney', 4)],
      ],
      'TR',
      [],
    );

    expect(options.map((item) => item.providerId)).toEqual([8, 119, 337]);
  });

  it('hides sparse platforms only in their region and never hides a saved one', () => {
    const catalogs = [[provider(1791, 'Exxen'), provider(2235, 'tabii')]];

    expect(buildPlatformOptions(catalogs, 'TR', [])).toEqual([]);
    expect(buildPlatformOptions(catalogs, 'TR', [1791]).map((item) => item.providerId)).toEqual([
      1791,
    ]);
    expect(buildPlatformOptions(catalogs, 'DE', [])).toHaveLength(2);
  });
});

describe('MyPlatformsFilter', () => {
  const onChange = jest.fn();
  const onChoose = jest.fn();
  const available = [provider(8, 'Netflix'), provider(119, 'Prime')];

  const renderFilter = (selectedProviderIds: number[] = []) =>
    render(
      <MyPlatformsFilter
        availableProviders={available}
        selectedProviderIds={selectedProviderIds}
        onChange={onChange}
        onChoose={onChoose}
      />,
    );

  beforeEach(() => {
    jest.clearAllMocks();
    mockSavedIds = [];
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: true });
  });

  it('is hidden for signed-out users', () => {
    (useAuth as jest.Mock).mockReturnValue({ isAuthenticated: false });
    renderFilter();
    expect(screen.queryByText(t('extras.myPlatformsChoose'))).toBeNull();
  });

  it('opens the picker when nothing is saved', () => {
    renderFilter();
    fireEvent.press(screen.getByTestId('discover-my-platforms-choose'));
    expect(onChoose).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/profile/platforms');
  });

  it('filters by the saved platforms that exist in this catalog', () => {
    mockSavedIds = [8, 999];
    renderFilter();
    fireEvent.press(screen.getByTestId('discover-my-platforms'));
    expect(onChange).toHaveBeenCalledWith([8]);
  });

  it('turns the filter off when it is already applied', () => {
    mockSavedIds = [8, 119];
    renderFilter([119, 8]);
    fireEvent.press(screen.getByTestId('discover-my-platforms'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('as the only platform control, can turn off a filter that no longer matches the saved list', () => {
    mockSavedIds = [];
    render(
      <MyPlatformsFilter
        availableProviders={available}
        selectedProviderIds={[8]}
        onChange={onChange}
        onChoose={onChoose}
        isOnlyPlatformControl
      />,
    );
    fireEvent.press(screen.getByTestId('discover-my-platforms'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('is disabled when no saved platform exists here, so it cannot show everything', () => {
    mockSavedIds = [999];
    renderFilter();
    fireEvent.press(screen.getByTestId('discover-my-platforms'));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(t('extras.myPlatformsUnavailable'))).toBeTruthy();
  });
});
