import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { PersonHero } from '@/features/details/person/components/PersonHero';

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
          testID: 'portrait-image-viewer',
          onPress: onClose,
        })
      : null,
}));

describe('PersonHero portrait viewer', () => {
  it('opens fullscreen viewer when portrait is pressed', () => {
    render(
      <PersonHero
        name="Matthew McConaughey"
        profileImagePath="/profile.jpg"
        knownForDepartment="Acting"
        birthday="1969-11-04"
        deathday={null}
        placeOfBirth="Texas"
      />,
    );

    expect(screen.queryByTestId('portrait-image-viewer')).toBeNull();

    fireEvent.press(screen.getByTestId('person-hero-portrait'));

    expect(screen.getByTestId('portrait-image-viewer')).toBeTruthy();
  });

  it('does not render portrait press target when profile image is missing', () => {
    render(
      <PersonHero
        name="Jane Actor"
        profileImagePath={null}
        knownForDepartment={null}
        birthday={null}
        deathday={null}
        placeOfBirth={null}
      />,
    );

    expect(screen.queryByTestId('person-hero-portrait')).toBeNull();
    expect(screen.queryByTestId('portrait-image-viewer')).toBeNull();
  });
});
