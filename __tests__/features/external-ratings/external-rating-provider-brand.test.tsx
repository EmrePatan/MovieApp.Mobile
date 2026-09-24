import { render } from '@testing-library/react-native';
import { ExternalRatingProviderBrand } from '@/features/external-ratings/components/ExternalRatingProviderBrand';

describe('ExternalRatingProviderBrand', () => {
  it('renders bundled image brands for imdb', () => {
    const screen = render(<ExternalRatingProviderBrand source="imdb" />);
    expect(
      screen.getByTestId('external-rating-brand-imdb', { includeHiddenElements: true }),
    ).toBeTruthy();
  });

  it('renders rotten tomatoes tomatometer and popcorn icons', () => {
    const screen = render(<ExternalRatingProviderBrand source="rotten-tomatoes" />);
    expect(screen.getByTestId('rt-tomatometer-icon', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId('rt-popcorn-icon', { includeHiddenElements: true })).toBeTruthy();
  });

  it('falls back to text for unknown providers', () => {
    const screen = render(<ExternalRatingProviderBrand source="unknown-provider" />);
    expect(screen.getByText('unknown-provider')).toBeTruthy();
  });
});
