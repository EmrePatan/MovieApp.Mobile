import { act, render, screen } from '@testing-library/react-native';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import { PosterImage, POSTER_LOADING_VEIL } from '@/components/common/PosterImage';

function findLoadingVeil() {
  return screen.UNSAFE_getAllByType(View).find((view) => {
    const style = StyleSheet.flatten(view.props.style);
    return style?.backgroundColor === POSTER_LOADING_VEIL;
  });
}

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

    const image = screen.UNSAFE_getByType(Image);
    expect(image.props.cachePolicy).toBe('memory-disk');
    expect(image.props.contentFit).toBe('cover');
    expect(image.props.recyclingKey).toBe(
      'https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg:0',
    );
    expect(image.props.transition).toBeNull();
    expect(screen.UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    const veil = findLoadingVeil();
    expect(veil).toBeTruthy();
    expect(StyleSheet.flatten(veil?.props.style).backgroundColor).toBe(POSTER_LOADING_VEIL);
    expect(POSTER_LOADING_VEIL).not.toBe('#1C1C28');
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

  it('clears the veil when the bitmap is displayed, before onLoadEnd', () => {
    render(
      <PosterImage
        uri="/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg"
        width={120}
        height={180}
        accessibilityLabel="Interstellar poster"
      />,
    );

    act(() => {
      screen.UNSAFE_getByType(Image).props.onDisplay?.();
    });

    expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    expect(findLoadingVeil()).toBeUndefined();
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
      image.props.onLoadEnd?.();
    });

    expect(screen.UNSAFE_getByType(Image)).toBeTruthy();
    expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
  });

  it('keeps the poster visible when onError fires after a successful load', () => {
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
      image.props.onError?.();
    });

    expect(screen.UNSAFE_getByType(Image)).toBeTruthy();
    expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    expect(screen.queryByLabelText('film-outline')).toBeNull();
  });

  it('shows the fallback when onLoadEnd follows each failed attempt', () => {
    render(
      <PosterImage
        uri="/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg"
        width={120}
        height={180}
        accessibilityLabel="Interstellar poster"
      />,
    );

    const failedLoadEnd = screen.UNSAFE_getByType(Image).props.onLoadEnd;

    act(() => {
      screen.UNSAFE_getByType(Image).props.onError?.();
    });
    act(() => {
      failedLoadEnd?.();
    });

    act(() => {
      const retriedImage = screen.UNSAFE_getByType(Image);
      retriedImage.props.onError?.();
      retriedImage.props.onLoadEnd?.();
    });

    expect(screen.UNSAFE_queryByType(Image)).toBeNull();
    expect(screen.getByLabelText('film-outline')).toBeTruthy();
  });

  it('treats onLoadEnd without onError as a successful load', () => {
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
      image.props.onLoadEnd?.();
    });
    act(() => {
      screen.UNSAFE_getByType(Image).props.onError?.();
    });

    expect(screen.UNSAFE_getByType(Image)).toBeTruthy();
    expect(screen.queryByLabelText('film-outline')).toBeNull();
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
      screen.UNSAFE_getByType(Image).props.onError?.();
    });

    expect(screen.UNSAFE_queryByType(Image)).toBeNull();
    expect(screen.UNSAFE_queryByType(ActivityIndicator)).toBeNull();
    expect(screen.getByLabelText('film-outline')).toBeTruthy();
  });

  it('ignores stale onError callbacks after the URI changes during recycling', () => {
    const { rerender } = render(
      <PosterImage
        uri="/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg"
        width={120}
        height={180}
        accessibilityLabel="Interstellar poster"
      />,
    );

    const staleOnError = screen.UNSAFE_getByType(Image).props.onError;

    rerender(
      <PosterImage
        uri="/7Fdh7gUq3plvQqxRbNYhWvDABXA.jpg"
        width={120}
        height={180}
        accessibilityLabel="Dallas Buyers Club poster"
      />,
    );

    act(() => {
      staleOnError?.();
    });

    expect(screen.UNSAFE_getByType(Image)).toBeTruthy();
    expect(screen.queryByLabelText('film-outline')).toBeNull();
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
      screen.UNSAFE_getByType(Image).props.onError?.();
    });
    act(() => {
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
