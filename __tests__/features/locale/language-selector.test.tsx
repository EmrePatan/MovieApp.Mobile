import { fireEvent, render, screen } from '@testing-library/react-native';
import { LanguageSelector } from '@/features/locale/components/LanguageSelector';

describe('LanguageSelector', () => {
  it('shows the selected language while collapsed', () => {
    render(
      <LanguageSelector
        label="App language"
        value="en"
        viewerLanguage="en"
        expanded={false}
        onToggleExpanded={jest.fn()}
        onSelect={jest.fn()}
      />,
    );

    expect(screen.getByLabelText('App language English')).toBeTruthy();
    expect(screen.queryByLabelText('Turkish')).toBeNull();
  });

  it('renders language options and preserves selection behavior', () => {
    const onSelect = jest.fn();
    const onToggleExpanded = jest.fn();

    render(
      <LanguageSelector
        label="App language"
        value="en"
        viewerLanguage="en"
        expanded
        onToggleExpanded={onToggleExpanded}
        onSelect={onSelect}
      />,
    );

    expect(screen.getAllByText('English').length).toBeGreaterThan(0);
    expect(screen.getByText('Turkish')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Turkish'));

    expect(onSelect).toHaveBeenCalledWith('tr');
  });
});
