import React from 'react';
import { act, render, screen } from '@testing-library/react-native';
import { Image } from 'react-native';
import { ProviderLogoImage } from '@/components/common/ProviderLogoImage';

describe('ProviderLogoImage', () => {
  const originalEnv = process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

  afterEach(() => {
    process.env.EXPO_PUBLIC_IMAGE_BASE_URL = originalEnv;
  });

  it('renders a TMDB provider logo without EXPO_PUBLIC_IMAGE_BASE_URL', () => {
    delete process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

    render(
      <ProviderLogoImage
        name="Netflix"
        logoPath="/t2yyOv40MXewkV0fpueqeCOFxPF.png"
        size={54}
        testID="provider-logo"
      />,
    );

    const image = screen.getByTestId('provider-logo');
    expect(image.props.source.uri).toBe(
      'https://image.tmdb.org/t/p/w92/t2yyOv40MXewkV0fpueqeCOFxPF.png',
    );
  });

  it('falls back to w500 when w92 fails to load', () => {
    delete process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

    render(
      <ProviderLogoImage
        name="Netflix"
        logoPath="/t2yyOv40MXewkV0fpueqeCOFxPF.png"
        size={54}
        testID="provider-logo"
      />,
    );

    const image = screen.getByTestId('provider-logo');
    expect(image.props.source.uri).toContain('/w92/');

    act(() => {
      image.props.onError?.();
    });

    const resizedImage = screen.getByTestId('provider-logo');
    expect(resizedImage.props.source.uri).toBe(
      'https://image.tmdb.org/t/p/w500/t2yyOv40MXewkV0fpueqeCOFxPF.png',
    );
  });

  it('shows a letter fallback after both provider sizes fail', () => {
    delete process.env.EXPO_PUBLIC_IMAGE_BASE_URL;

    render(
      <ProviderLogoImage
        name="Netflix"
        logoPath="/t2yyOv40MXewkV0fpueqeCOFxPF.png"
        size={54}
        testID="provider-logo"
      />,
    );

    act(() => {
      screen.getByTestId('provider-logo').props.onError?.();
      screen.getByTestId('provider-logo').props.onError?.();
      screen.getByTestId('provider-logo').props.onError?.();
    });

    expect(screen.getByTestId('provider-logo-fallback')).toBeTruthy();
    expect(screen.UNSAFE_queryByType(Image)).toBeNull();
  });

  it('shows a letter fallback when logoPath is missing', () => {
    render(
      <ProviderLogoImage
        name="Netflix"
        logoPath={null}
        size={54}
        testID="provider-logo"
      />,
    );

    expect(screen.getByTestId('provider-logo-fallback')).toBeTruthy();
    expect(screen.getByText('N')).toBeTruthy();
  });
});
