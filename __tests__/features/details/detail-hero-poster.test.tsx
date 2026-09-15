import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { DetailHero } from '@/features/details/shared/components/DetailHero';

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@/features/gallery/components/ImageViewerModal', () => ({
  ImageViewerModal: ({
    visible,
    onClose,
  }: {
    visible: boolean;
    onClose: () => void;
  }) =>
    visible
      ? require('react').createElement('Pressable', {
          testID: 'poster-image-viewer',
          onPress: onClose,
        })
      : null,
}));

describe('DetailHero poster viewer', () => {
  it('opens fullscreen viewer when poster is pressed', () => {
    render(
      <DetailHero
        title="Interstellar"
        posterPath="/poster.jpg"
        backdropPath="/backdrop.jpg"
        metadataLine="2014 · 2h 49m"
      />,
    );

    expect(screen.queryByTestId('poster-image-viewer')).toBeNull();

    fireEvent.press(screen.getByTestId('detail-hero-poster'));

    expect(screen.getByTestId('poster-image-viewer')).toBeTruthy();
  });

  it('does not render poster press target when poster path is missing', () => {
    render(
      <DetailHero
        title="Interstellar"
        posterPath={null}
        backdropPath="/backdrop.jpg"
        metadataLine="2014 · 2h 49m"
      />,
    );

    expect(screen.queryByTestId('detail-hero-poster')).toBeNull();
    expect(screen.queryByTestId('poster-image-viewer')).toBeNull();
  });
});
