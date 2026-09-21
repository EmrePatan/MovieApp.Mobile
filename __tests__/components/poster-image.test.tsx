import { act, render, screen } from '@testing-library/react-native';
import { ActivityIndicator, Image } from 'react-native';
import { PosterImage } from '@/components/common/PosterImage';

describe('PosterImage loading lifecycle', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
  });

  it('starts in loading state for a valid URI', () => {
    render(
      <PosterImage
        uri="/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg"
        width={120}
        height={180}
        accessibilityLabel="Interstellar poster"
      />,
    );

    expect(screen.UNSAFE_getByType(Image)).toBeTruthy();
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
  });

  it('clears the spinner immediately on onLoad', () => {
    render(
      <PosterImage
        uri="/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg"
        width={120}
        height={180}
        accessibilityLabel="Interstellar poster"
      />,
    );

    const image = screen.UNSAFE_getByType(Image);

    act(() => {
      image.props.onLoad?.();
    });

    expect(screen.UNSAFE_getByType(Image)).toBeTruthy();
    expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  it('clears the spinner on onLoadEnd', () => {
    render(
      <PosterImage
        uri="/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg"
        width={120}
        height={180}
        accessibilityLabel="Inception poster"
      />,
    );

    const image = screen.UNSAFE_getByType(Image);

    act(() => {
      image.props.onLoadStart?.();
      image.props.onLoadEnd?.();
    });

    expect(screen.UNSAFE_getByType(Image)).toBeTruthy();
    expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  it('retries once on transient onError before showing fallback', () => {
    render(
      <PosterImage
        uri="/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg"
        width={120}
        height={180}
        accessibilityLabel="Interstellar poster"
      />,
    );

    const firstUri = screen.UNSAFE_getByType(Image).props.source.uri;

    act(() => {
      screen.UNSAFE_getByType(Image).props.onError?.();
    });

    const retriedImage = screen.UNSAFE_getByType(Image);
    expect(retriedImage.props.source.uri).toBe(firstUri);

    act(() => {
      retriedImage.props.onError?.();
    });

    expect(screen.UNSAFE_queryByType(Image)).toBeNull();
    expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    expect(screen.getByLabelText('film-outline')).toBeTruthy();
  });

  it('resets loading and error state when the source URI changes', () => {
    const { rerender } = render(
      <PosterImage
        uri="/broken.jpg"
        width={120}
        height={180}
        accessibilityLabel="Recycled poster"
      />,
    );

    act(() => {
      const image = screen.UNSAFE_getByType(Image);
      image.props.onError?.();
      screen.UNSAFE_getByType(Image).props.onError?.();
    });

    expect(screen.UNSAFE_queryByType(Image)).toBeNull();

    rerender(
      <PosterImage
        uri="/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg"
        width={120}
        height={180}
        accessibilityLabel="Recycled poster"
      />,
    );

    const image = screen.UNSAFE_getByType(Image);
    expect(image.props.source.uri).toBe(
      'https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg',
    );
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();

    act(() => {
      image.props.onLoad?.();
    });

    expect(screen.UNSAFE_getByType(Image)).toBeTruthy();
    expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  it('keeps a successfully loaded image mounted without timeout fallback', () => {
    jest.useFakeTimers();

    render(
      <PosterImage
        uri="/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg"
        width={120}
        height={180}
        accessibilityLabel="Avengers poster"
      />,
    );

    const image = screen.UNSAFE_getByType(Image);

    act(() => {
      image.props.onLoad?.();
    });

    act(() => {
      jest.advanceTimersByTime(60_000);
    });

    expect(screen.UNSAFE_getByType(Image)).toBeTruthy();
    expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    expect(screen.queryByLabelText('film-outline')).toBeNull();

    jest.useRealTimers();
  });
});
