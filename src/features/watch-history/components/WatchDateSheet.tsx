import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/buttons/AppButton';
import { AppText } from '@/components/common/AppText';
import { AppBottomSheet } from '@/components/layout/AppBottomSheet';
import { premiumSheet, premiumSheetChrome } from '@/theme/premium-sheet';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { UpdateWatchDatesRequest, WatchDateMode } from '../types';
import { toIsoDay } from '../utils/watch-date';
import {
  CalendarPicker,
  clampDate,
  MonthPicker,
  YearPicker,
  YEARS_PER_PAGE,
  type PickedDate,
} from './WatchDatePickers';

export type WatchDateChoice = Pick<UpdateWatchDatesRequest, 'mode' | 'date' | 'year'>;

interface WatchDateSheetProps {
  visible: boolean;
  selectedCount: number;
  /** Replaces the "N selected" line. */
  subtitle?: string;
  /** Shown above Save, for changes that reach beyond what is on screen. */
  warning?: string;
  saveDisabled?: boolean;
  saving: boolean;
  errorMessage: string | null;
  onClose: () => void;
  onSave: (choice: WatchDateChoice) => void;
}

const MODES: { mode: WatchDateMode; labelKey: string; hintKey?: string; opensPicker?: boolean }[] = [
  { mode: 'day', labelKey: 'extras.historyDatesModeDay', opensPicker: true },
  { mode: 'year', labelKey: 'extras.historyDatesModeYear', opensPicker: true },
  {
    mode: 'release',
    labelKey: 'extras.historyDatesModeRelease',
    hintKey: 'extras.historyDatesModeReleaseHint',
  },
  {
    mode: 'unknown',
    labelKey: 'extras.historyDatesModeUnknown',
    hintKey: 'extras.historyDatesModeUnknownHint',
  },
];

/** One thing on screen at a time: the options, or the picker the chosen option needs. */
type Step = 'options' | 'calendar' | 'years' | 'months';

export function WatchDateSheet({
  visible,
  selectedCount,
  subtitle,
  onClose,
  ...formProps
}: WatchDateSheetProps) {
  const { t } = useTranslation();

  return (
    <AppBottomSheet
      visible={visible}
      onClose={onClose}
      title={t('extras.historyDatesSheetTitle')}
      subtitle={subtitle ?? t('extras.historyDatesSelected', { count: selectedCount })}
      testID="watch-date-sheet"
    >
      {/* Mounted only while the sheet is open, so every opening starts fresh. */}
      <WatchDateForm {...formProps} />
    </AppBottomSheet>
  );
}

function WatchDateForm({
  saving,
  errorMessage,
  warning,
  saveDisabled = false,
  onSave,
}: Pick<
  WatchDateSheetProps,
  'saving' | 'errorMessage' | 'warning' | 'saveDisabled' | 'onSave'
>) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<WatchDateMode | null>(null);
  const [step, setStep] = useState<Step>('options');
  const [date, setDate] = useState<PickedDate>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
  });
  const [pickedYear, setPickedYear] = useState<number | null>(null);
  const [yearPage, setYearPage] = useState(0);

  const chooseMode = (next: WatchDateMode) => {
    setMode(next);
    if (next === 'day') {
      setStep('calendar');
    } else if (next === 'year') {
      setYearPage(0);
      setStep('years');
    }
  };

  const openYearsFromCalendar = () => {
    setYearPage(Math.floor((new Date().getFullYear() - date.year) / YEARS_PER_PAGE));
    setStep('years');
  };

  const selectYear = (year: number) => {
    if (mode === 'day') {
      setDate(clampDate({ ...date, year }));
      setStep('months');
    } else {
      setPickedYear(year);
    }
  };

  const save = () => {
    if (mode === 'day') {
      onSave({ mode, date: toIsoDay(date.year, date.month, date.day) });
    } else if (mode === 'year' && pickedYear !== null) {
      onSave({ mode, year: pickedYear });
    } else if (mode === 'release' || mode === 'unknown') {
      onSave({ mode });
    }
  };

  // While jumping to another year or month there is nothing to save yet.
  const jumping = mode === 'day' && step !== 'calendar' && step !== 'options';
  const canSave = mode !== null && !jumping && (mode !== 'year' || pickedYear !== null);

  return (
    <>
      {step === 'options' ? (
        <View style={styles.options}>
          {MODES.map((option) => {
            const active = mode === option.mode && !option.opensPicker;
            return (
              <Pressable
                key={option.mode}
                accessibilityRole={option.opensPicker ? 'button' : 'radio'}
                accessibilityState={option.opensPicker ? undefined : { checked: active }}
                accessibilityLabel={t(option.labelKey)}
                onPress={() => chooseMode(option.mode)}
                style={[premiumSheetChrome.optionRow, active && premiumSheetChrome.optionRowSelected]}
              >
                <View style={styles.optionText}>
                  <AppText
                    variant="body"
                    style={active ? premiumSheetChrome.optionLabelSelected : styles.label}
                  >
                    {t(option.labelKey)}
                  </AppText>
                  {option.hintKey ? (
                    <AppText variant="caption" style={styles.hint}>
                      {t(option.hintKey)}
                    </AppText>
                  ) : null}
                </View>
                {option.opensPicker ? (
                  <Ionicons name="chevron-forward" size={18} color={premiumSheet.textSecondary} />
                ) : active ? (
                  <Ionicons name="checkmark" size={18} color={premiumSheet.mutedGold} />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              setMode(null);
              setPickedYear(null);
              setStep('options');
            }}
            style={styles.back}
          >
            <Ionicons name="arrow-back" size={16} color={premiumSheet.mutedGold} />
            <AppText variant="bodySmall" style={premiumSheetChrome.optionLabelSelected}>
              {t('extras.historyDatesBack')}
            </AppText>
          </Pressable>
          {step === 'calendar' ? (
            <CalendarPicker value={date} onChange={setDate} onTitlePress={openYearsFromCalendar} />
          ) : step === 'years' ? (
            <YearPicker
              value={mode === 'day' ? date.year : pickedYear}
              page={yearPage}
              onPageChange={setYearPage}
              onSelect={selectYear}
            />
          ) : (
            <MonthPicker
              year={date.year}
              value={date.month}
              onSelect={(month) => {
                setDate(clampDate({ ...date, month }));
                setStep('calendar');
              }}
            />
          )}
        </View>
      )}

      {errorMessage ? (
        <AppText variant="bodySmall" center style={styles.error} accessibilityRole="alert">
          {errorMessage}
        </AppText>
      ) : null}

      {warning ? (
        <AppText variant="caption" center style={styles.hint}>
          {warning}
        </AppText>
      ) : null}

      <AppButton
        title={t('common.save')}
        onPress={save}
        disabled={!canSave || saveDisabled}
        loading={saving}
      />
    </>
  );
}

const styles = StyleSheet.create({
  options: { gap: 8 },
  optionText: { flex: 1, paddingVertical: spacing.xs },
  label: { color: premiumSheet.textPrimary },
  hint: { color: premiumSheet.textSecondary },
  back: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 32,
  },
  error: { color: colors.error },
});
