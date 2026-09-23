import { fireEvent, render, screen } from '@testing-library/react-native';
import { RegionSelector } from '@/features/regions/components/RegionSelector';

jest.mock('@/i18n', () => {
  const actual = jest.requireActual<typeof import('@/i18n')>('@/i18n');
  return {
    ...actual,
    getUiFormatLocaleTag: jest.fn(() => 'en-US'),
  };
});

describe('RegionSelector', () => {
  it('renders semantic label and selected region', () => {
    render(
      <RegionSelector
        label="Watch region"
        value="TR"
        expanded={false}
        onToggleExpanded={jest.fn()}
        onSelect={jest.fn()}
        testID="watch-region-selector"
      />,
    );

    expect(screen.getByText('Watch region')).toBeTruthy();
    expect(screen.getByLabelText('Watch region Türkiye')).toBeTruthy();
    expect(screen.queryByLabelText('United States')).toBeNull();
  });

  it('lists region options with flags when expanded', () => {
    render(
      <RegionSelector
        label="Release region"
        value="TR"
        expanded={true}
        onToggleExpanded={jest.fn()}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('United States')).toBeTruthy();
    expect(screen.getByLabelText('United Kingdom')).toBeTruthy();
  });

  it('calls onSelect when a region is chosen', () => {
    const onSelect = jest.fn();

    render(
      <RegionSelector
        label="Release region"
        value="TR"
        expanded={true}
        onToggleExpanded={jest.fn()}
        onSelect={onSelect}
      />,
    );

    fireEvent.press(screen.getByLabelText('United States'));
    expect(onSelect).toHaveBeenCalledWith('US');
  });
});
