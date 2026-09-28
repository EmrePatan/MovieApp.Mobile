import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Share } from 'react-native';
import { DetailShareButton } from '@/features/details/shared/components/DetailShareButton';

jest.mock('@/features/metrics/track-product-metric', () => ({
  trackProductMetric: jest.fn(),
}));

describe('DetailShareButton', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_APP_WEB_URL = 'https://moviecaveapp.com';
    process.env.EXPO_PUBLIC_APP_ENV = 'development';
    jest.spyOn(Share, 'share').mockResolvedValue({ action: 'sharedAction' });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders on movie detail hero chrome', () => {
    const screen = render(
      <DetailShareButton
        contentType="movie"
        contentId="3fa85f64-5717-4562-b3fc-2c963f66afa6"
        title="Inception"
        releaseDate="2010-07-16"
        topOffset={12}
      />,
    );

    expect(screen.getByTestId('detail-share-button')).toBeTruthy();
    fireEvent.press(screen.getByTestId('detail-share-button'));

    expect(Share.share).toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringMatching(/^https:\/\/moviecaveapp\.com\/movie\//),
        message: expect.stringContaining('https://moviecaveapp.com/movie/'),
      }),
    );
  });
});
