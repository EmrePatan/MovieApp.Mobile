import { render, screen } from '@testing-library/react-native';
import { GalleryPreviewSection } from '@/features/gallery/components/GalleryPreviewSection';
import type { GalleryImage } from '@/features/gallery/types';

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

const portraitImage: GalleryImage = {
  id: 'portrait',
  filePath: '/portrait.jpg',
  aspectRatio: 0.67,
  width: 600,
  height: 900,
  type: 'Backdrop',
};

const landscapeImage: GalleryImage = {
  id: 'landscape',
  filePath: '/landscape.jpg',
  aspectRatio: 1.78,
  width: 1600,
  height: 900,
  type: 'Backdrop',
};

describe('GalleryPreviewSection', () => {
  it('uses uniform preview frame dimensions for mixed aspect ratios', () => {
    render(<GalleryPreviewSection title="Gallery" images={[portraitImage, landscapeImage]} />);

    const first = screen.getByTestId('gallery-preview-item-0');
    const second = screen.getByTestId('gallery-preview-item-1');

    expect(first.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 112, height: 75 }),
      ]),
    );
    expect(second.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ width: 112, height: 75 }),
      ]),
    );
  });
});
