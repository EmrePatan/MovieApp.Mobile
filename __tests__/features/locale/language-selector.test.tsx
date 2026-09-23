import { fireEvent, render, screen } from '@testing-library/react-native';
import { changeUiLanguage } from '@/i18n';
import { LanguageSelector } from '@/features/locale/components/LanguageSelector';
import { SUPPORTED_UI_LANGUAGES } from '@/i18n/types';

describe('LanguageSelector', () => {
  beforeEach(async () => {
    await changeUiLanguage('en');
  });

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

  it('renders all seven language options and preserves selection behavior', () => {
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

    expect(SUPPORTED_UI_LANGUAGES).toHaveLength(7);
    expect(screen.getByLabelText('English')).toBeTruthy();
    expect(screen.getByLabelText('Turkish')).toBeTruthy();
    expect(screen.getByLabelText('German')).toBeTruthy();
    expect(screen.getByLabelText('Portuguese (Brazil)')).toBeTruthy();

    fireEvent.press(screen.getByLabelText('Turkish'));

    expect(onSelect).toHaveBeenCalledWith('tr');
  });
});
