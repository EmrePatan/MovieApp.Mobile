import { act, render, screen } from '@testing-library/react-native';
import { Image } from 'react-native';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';
import { REMOTE_IMAGE_LOAD_TIMEOUT_MS } from '@/hooks/useRemoteImageState';

jest.mock('react', () => jest.requireActual('react'));

describe('CatalogImage grid isolation', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('resolves library poster paths into distinct Image sources', () => {
    render(
      <>
        <CatalogImage
          path="/poster-a.jpg"
          width={100}
          height={150}
          accessibilityLabel="Poster A"
        />
        <CatalogImage
          path="/poster-b.jpg"
          width={100}
          height={150}
          accessibilityLabel="Poster B"
        />
      </>,
    );

    const images = screen.UNSAFE_getAllByType(Image);
    expect(images).toHaveLength(2);
    expect(images[0].props.source.uri).toBe('https://image.tmdb.org/t/p/w500/poster-a.jpg');
    expect(images[1].props.source.uri).toBe('https://image.tmdb.org/t/p/w500/poster-b.jpg');
  });

  it('does not let one hung image replace another loaded image after timeout', () => {
    render(
      <>
        <CatalogImage
          path="/loaded.jpg"
          width={100}
          height={150}
          accessibilityLabel="Loaded poster"
        />
        <CatalogImage
          path="/stuck.jpg"
          width={100}
          height={150}
          accessibilityLabel="Stuck poster"
        />
      </>,
    );

    const images = screen.UNSAFE_getAllByType(Image);

    act(() => {
      images[0].props.onLoadStart?.();
      images[0].props.onLoad?.();
      images[1].props.onLoadStart?.();
    });

    act(() => {
      jest.advanceTimersByTime(REMOTE_IMAGE_LOAD_TIMEOUT_MS);
    });

    const remainingImages = screen.UNSAFE_getAllByType(Image);
    expect(remainingImages).toHaveLength(1);
    expect(remainingImages[0].props.source.uri).toBe(
      'https://image.tmdb.org/t/p/w500/loaded.jpg',
    );
    expect(screen.getByLabelText('Loaded poster')).toBeTruthy();
    expect(screen.getByLabelText('Stuck poster')).toBeTruthy();
  });

  it('resets image state independently when a cell is recycled to a new source', () => {
    const { rerender } = render(
      <CatalogImage
        path="/first.jpg"
        width={100}
        height={150}
        accessibilityLabel="Recycled poster"
      />,
    );

    const firstImage = screen.UNSAFE_getByType(Image);

    act(() => {
      firstImage.props.onLoadStart?.();
      firstImage.props.onLoad?.();
    });

    rerender(
      <CatalogImage
        path="/second.jpg"
        width={100}
        height={150}
        accessibilityLabel="Recycled poster"
      />,
    );

    const recycledImage = screen.UNSAFE_getByType(Image);
    expect(recycledImage.props.source.uri).toBe('https://image.tmdb.org/t/p/w500/second.jpg');

    act(() => {
      recycledImage.props.onLoadStart?.();
    });

    act(() => {
      jest.advanceTimersByTime(REMOTE_IMAGE_LOAD_TIMEOUT_MS);
    });

    expect(screen.UNSAFE_queryByType(Image)).toBeNull();
    expect(screen.getByLabelText('Recycled poster')).toBeTruthy();
  });
});
