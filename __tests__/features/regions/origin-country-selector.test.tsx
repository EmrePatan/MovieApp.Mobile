import { fireEvent, render, screen } from '@testing-library/react-native';
import { OriginCountrySelector } from '@/features/regions/components/OriginCountrySelector';
import { t } from '../../i18n/i18n-test-utils';

describe('OriginCountrySelector', () => {
  it('expands options and reports selection', () => {
    const onSelect = jest.fn();

    render(
      <OriginCountrySelector
        value="KR"
        expanded={false}
        onToggleExpanded={jest.fn()}
        onSelect={onSelect}
        testID="origin-country-selector"
      />,
    );

    expect(
      screen.queryByLabelText(t('discover.worldCinemaHub.countryLabels.JP')),
    ).toBeNull();
  });

  it('shows country options when expanded', () => {
    const onSelect = jest.fn();

    render(
      <OriginCountrySelector
        value="KR"
        expanded
        onToggleExpanded={jest.fn()}
        onSelect={onSelect}
      />,
    );

    fireEvent.press(screen.getByLabelText(t('discover.worldCinemaHub.countryLabels.JP')));
    expect(onSelect).toHaveBeenCalledWith('JP');
  });
});
