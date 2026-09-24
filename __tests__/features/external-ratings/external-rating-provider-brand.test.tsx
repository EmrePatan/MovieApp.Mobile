import { render } from '@testing-library/react-native';
import { ExternalRatingProviderBrand } from '@/features/external-ratings/components/ExternalRatingProviderBrand';

jest.mock('react-native-svg', () => {
  const React = require('react');
  const { Text: RNText } = require('react-native');
  return {
    SvgXml: ({ xml }: { xml: string }) => <RNText testID="svg-brand">{xml.slice(0, 20)}</RNText>,
  };
});

describe('ExternalRatingProviderBrand', () => {
  it('renders svg-backed brands for imdb', () => {
    const screen = render(<ExternalRatingProviderBrand source="imdb" />);
    expect(screen.getByTestId('svg-brand', { includeHiddenElements: true })).toBeTruthy();
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
