import { fireEvent, render, screen } from '@testing-library/react-native';
import { WatchDateSheet } from '@/features/watch-history/components/WatchDateSheet';
import { t } from '../../i18n/i18n-test-utils';

describe('WatchDateSheet', () => {
  const onSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date(2026, 10, 26, 10, 0, 0));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const renderSheet = () =>
    render(
      <WatchDateSheet
        visible
        selectedCount={1}
        saving={false}
        errorMessage={null}
        onClose={jest.fn()}
        onSave={onSave}
      />,
    );

  const press = (testID: string) => fireEvent.press(screen.getByTestId(testID));
  const save = () => fireEvent.press(screen.getByText(t('common.save')));

  it('saves a day picked on the calendar', () => {
    renderSheet();
    fireEvent.press(screen.getByLabelText(t('extras.historyDatesModeDay')));
    press('watch-date-day-3');
    save();

    expect(onSave).toHaveBeenCalledWith({ mode: 'day', date: '2026-11-03' });
  });

  it('jumps to another year and month from the calendar title', () => {
    renderSheet();
    fireEvent.press(screen.getByLabelText(t('extras.historyDatesModeDay')));
    press('watch-date-title');
    press('watch-date-year-2019');
    press('watch-date-month-2');
    save();

    // The picked day (26) is kept.
    expect(onSave).toHaveBeenCalledWith({ mode: 'day', date: '2019-02-26' });
  });

  it('does not offer days after today', () => {
    renderSheet();
    fireEvent.press(screen.getByLabelText(t('extras.historyDatesModeDay')));
    press('watch-date-day-27');
    save();

    expect(onSave).toHaveBeenCalledWith({ mode: 'day', date: '2026-11-26' });
  });

  it('needs a year before saving a year-only date', () => {
    renderSheet();
    fireEvent.press(screen.getByLabelText(t('extras.historyDatesModeYear')));
    save();
    expect(onSave).not.toHaveBeenCalled();

    press('watch-date-year-2020');
    save();
    expect(onSave).toHaveBeenCalledWith({ mode: 'year', year: 2020 });
  });
});
