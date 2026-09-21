import { act, render, screen } from '@testing-library/react-native';
import { Image } from 'react-native';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';

describe('CatalogImage grid isolation', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  });

  it('resolves real library poster paths into distinct Image sources', () => {
    render(
      <>
        <CatalogImage
          path="/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg"
          width={100}
          height={150}
          accessibilityLabel="Poster A"
        />
        <CatalogImage
          path="/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg"
          width={100}
          height={150}
          accessibilityLabel="Poster B"
        />
      </>,
    );

    const images = screen.UNSAFE_getAllByType(Image);
    expect(images).toHaveLength(2);
    expect(images[0].props.source.uri).toBe(
      'https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    );
    expect(images[1].props.source.uri).toBe(
      'https://image.tmdb.org/t/p/w500/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg',
    );
  });

  it('keeps hung and loaded images mounted independently without a timeout fallback', () => {
    render(
      <>
        <CatalogImage
          path="/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg"
          width={100}
          height={150}
          accessibilityLabel="Loaded poster"
        />
        <CatalogImage
          path="/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg"
          width={100}
          height={150}
          accessibilityLabel="Hung poster"
        />
      </>,
    );

    const images = screen.UNSAFE_getAllByType(Image);
    expect(images).toHaveLength(2);

    act(() => {
      images[1].props.onError?.();
      screen.UNSAFE_getAllByType(Image)[1]?.props.onError?.();
    });

    const remainingImages = screen.UNSAFE_getAllByType(Image);
    expect(remainingImages).toHaveLength(1);
    expect(remainingImages[0].props.source.uri).toBe(
      'https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg',
    );
    expect(screen.getByLabelText('Hung poster')).toBeTruthy();
  });

  it('resets image state independently when a cell is recycled to a new source', () => {
    const { rerender } = render(
      <CatalogImage
        path="/broken.jpg"
        width={100}
        height={150}
        accessibilityLabel="Recycled poster"
      />,
    );

    act(() => {
      const image = screen.UNSAFE_getByType(Image);
      image.props.onError?.();
      screen.UNSAFE_getByType(Image).props.onError?.();
    });

    rerender(
      <CatalogImage
        path="/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg"
        width={100}
        height={150}
        accessibilityLabel="Recycled poster"
      />,
    );

    const recycledImage = screen.UNSAFE_getByType(Image);
    expect(recycledImage.props.source.uri).toBe(
      'https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
    );
  });
});
