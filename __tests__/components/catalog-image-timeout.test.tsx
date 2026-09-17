import { act, render, screen } from '@testing-library/react-native';
import { Image } from 'react-native';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { REMOTE_IMAGE_LOAD_TIMEOUT_MS } from '@/hooks/useRemoteImageState';

jest.mock('react', () => jest.requireActual('react'));

describe('CatalogImage bounded loading', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('shows fallback after onLoadStart when no terminal callbacks arrive', () => {
    render(
      <CatalogImage
        path="/poster.jpg"
        width={120}
        height={180}
        accessibilityLabel="Stuck poster"
      />,
    );

    const image = screen.UNSAFE_getByType(Image);

    act(() => {
      image.props.onLoadStart?.();
    });

    expect(screen.UNSAFE_getByType(Image)).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(REMOTE_IMAGE_LOAD_TIMEOUT_MS);
    });

    expect(screen.UNSAFE_queryByType(Image)).toBeNull();
    expect(screen.getByLabelText('film-outline')).toBeTruthy();
    expect(screen.getByLabelText('Stuck poster')).toBeTruthy();
  });

  it('keeps loaded image visible after timeout when load succeeds', () => {
    render(
      <CatalogImage
        path="/poster.jpg"
        width={120}
        height={180}
        accessibilityLabel="Good poster"
      />,
    );

    const image = screen.UNSAFE_getByType(Image);

    act(() => {
      image.props.onLoadStart?.();
      image.props.onLoad?.();
    });

    act(() => {
      jest.advanceTimersByTime(REMOTE_IMAGE_LOAD_TIMEOUT_MS);
    });

    expect(screen.UNSAFE_getByType(Image)).toBeTruthy();
    expect(screen.queryByLabelText('film-outline')).toBeNull();
  });
});
