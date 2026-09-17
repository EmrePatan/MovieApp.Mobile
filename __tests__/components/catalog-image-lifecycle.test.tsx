import { act, render, screen } from '@testing-library/react-native';
import { Image } from 'react-native';
import { CatalogImage } from '@/features/details/shared/components/CatalogImage';

describe('CatalogImage lifecycle', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  });

  it('keeps Image mounted while loading without terminal callbacks', () => {
    render(
      <CatalogImage
        path="/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg"
        width={120}
        height={180}
        accessibilityLabel="Interstellar poster"
      />,
    );

    expect(screen.UNSAFE_getByType(Image)).toBeTruthy();
    expect(screen.queryByLabelText('film-outline')).toBeNull();
  });

  it('shows fallback only after onError', () => {
    render(
      <CatalogImage
        path="/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg"
        width={120}
        height={180}
        accessibilityLabel="Interstellar poster"
      />,
    );

    const image = screen.UNSAFE_getByType(Image);

    act(() => {
      image.props.onError?.();
    });

    expect(screen.UNSAFE_queryByType(Image)).toBeNull();
    expect(screen.getByLabelText('film-outline')).toBeTruthy();
    expect(screen.getByLabelText('Interstellar poster')).toBeTruthy();
  });

  it('resets error state when the source path changes', () => {
    const { rerender } = render(
      <CatalogImage
        path="/broken.jpg"
        width={120}
        height={180}
        accessibilityLabel="Recycled poster"
      />,
    );

    act(() => {
      screen.UNSAFE_getByType(Image).props.onError?.();
    });

    expect(screen.UNSAFE_queryByType(Image)).toBeNull();

    rerender(
      <CatalogImage
        path="/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg"
        width={120}
        height={180}
        accessibilityLabel="Recycled poster"
      />,
    );

    const image = screen.UNSAFE_getByType(Image);
    expect(image.props.source.uri).toBe(
      'https://image.tmdb.org/t/p/w500/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg',
    );
  });
});
