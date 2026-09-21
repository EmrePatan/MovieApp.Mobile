import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { GalleryGrid } from '@/features/gallery/components/GalleryGrid';
import type { GalleryImage } from '@/features/gallery/types';

const mockImageViewerModal = jest.fn(() => null);

jest.mock('@/features/gallery/components/ImageViewerModal', () => ({
  ImageViewerModal: (props: unknown) => {
    mockImageViewerModal(props);
    return null;
  },
}));

const images: GalleryImage[] = [
  { filePath: '/one.jpg', type: 'backdrop', aspectRatio: 1.78 },
  { filePath: '/two.jpg', type: 'poster', aspectRatio: 0.67 },
];

describe('GalleryGrid viewer lifecycle', () => {
  beforeEach(() => {
    mockImageViewerModal.mockClear();
  });

  it('opens the viewer at the tapped index and unmounts it on close', () => {
    render(<GalleryGrid images={images} />);

    fireEvent.press(screen.getByTestId('gallery-grid-item-1'));

    expect(mockImageViewerModal).toHaveBeenCalledWith(
      expect.objectContaining({
        visible: true,
        initialIndex: 1,
        images,
      }),
    );

    const { onClose } = mockImageViewerModal.mock.calls[0][0] as {
      onClose: () => void;
    };
    act(() => {
      onClose();
    });

    fireEvent.press(screen.getByTestId('gallery-grid-item-0'));

    expect(mockImageViewerModal).toHaveBeenLastCalledWith(
      expect.objectContaining({
        visible: true,
        initialIndex: 0,
      }),
    );
  });
});
