import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@/components/common/AppText';
import { getUiFormatLocaleTag } from '@/i18n';
import { premiumSheet, premiumSheetChrome } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';
import { daysInMonth, MIN_WATCH_YEAR } from '../utils/watch-date';

export const YEARS_PER_PAGE = 16;

export interface PickedDate {
  year: number;
  month: number;
  day: number;
}

function Cell({
  label,
  accessibilityLabel = label,
  selected,
  disabled = false,
  width,
  onPress,
  testID,
}: {
  label: string;
  accessibilityLabel?: string;
  selected: boolean;
  disabled?: boolean;
  width: `${number}%`;
  onPress: () => void;
  testID: string;
}) {
  return (
    <View style={[styles.cellSlot, { width }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected, disabled }}
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        onPress={onPress}
        style={[styles.cell, selected && styles.cellSelected, disabled && styles.cellDisabled]}
        testID={testID}
      >
        <AppText variant="bodySmall" style={selected ? premiumSheetChrome.optionLabelSelected : styles.label}>
          {label}
        </AppText>
      </Pressable>
    </View>
  );
}

/** "‹ title ›". The title becomes a button when `onTitlePress` is given. */
function Header({
  title,
  onTitlePress,
  onPrevious,
  onNext,
}: {
  title: string;
  onTitlePress?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
}) {
  const { t } = useTranslation();
  const arrow = (name: 'chevron-back' | 'chevron-forward', label: string, onPress?: () => void) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !onPress }}
      disabled={!onPress}
      onPress={onPress}
      style={[styles.arrow, !onPress && styles.cellDisabled]}
    >
      <Ionicons name={name} size={20} color={premiumSheet.textPrimary} />
    </Pressable>
  );

  return (
    <View style={styles.header}>
      {arrow('chevron-back', t('extras.historyDatesPrevious'), onPrevious)}
      <Pressable
        accessibilityRole={onTitlePress ? 'button' : 'header'}
        disabled={!onTitlePress}
        onPress={onTitlePress}
        style={styles.title}
        testID="watch-date-title"
      >
        <AppText variant="body" style={styles.titleLabel}>
          {title}
        </AppText>
        {onTitlePress ? (
          <Ionicons name="chevron-down" size={14} color={premiumSheet.mutedGold} />
        ) : null}
      </Pressable>
      {arrow('chevron-forward', t('extras.historyDatesNext'), onNext)}
    </View>
  );
}

export function CalendarPicker({
  value,
  onChange,
  onTitlePress,
}: {
  value: PickedDate;
  onChange: (value: PickedDate) => void;
  onTitlePress: () => void;
}) {
  const today = new Date();
  const locale = getUiFormatLocaleTag();
  const { year, month, day } = value;
  const monthTitle = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' });
  const fullDate = new Intl.DateTimeFormat(locale, { dateStyle: 'long' });
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();
  // Weeks start on Monday; 1 January 2024 was one.
  const leading = (new Date(year, month, 1).getDay() + 6) % 7;

  const showMonth = (offset: number) => {
    const target = new Date(year, month + offset, 1);
    const targetYear = target.getFullYear();
    const targetMonth = target.getMonth();
    onChange(clampDate({ year: targetYear, month: targetMonth, day }));
  };

  return (
    <View>
      <Header
        title={monthTitle.format(new Date(year, month, 1))}
        onTitlePress={onTitlePress}
        onPrevious={year === MIN_WATCH_YEAR && month === 0 ? undefined : () => showMonth(-1)}
        onNext={isCurrentMonth ? undefined : () => showMonth(1)}
      />
      <View style={styles.grid}>
        {Array.from({ length: 7 }, (_, index) => (
          <View key={index} style={styles.weekday}>
            <AppText variant="caption" style={styles.muted}>
              {weekday.format(new Date(2024, 0, 1 + index))}
            </AppText>
          </View>
        ))}
        {Array.from({ length: leading }, (_, index) => (
          <View key={`blank-${index}`} style={styles.weekday} />
        ))}
        {Array.from({ length: daysInMonth(year, month) }, (_, index) => (
          <Cell
            key={index}
            width="14.28%"
            label={String(index + 1)}
            accessibilityLabel={fullDate.format(new Date(year, month, index + 1))}
            selected={index + 1 === day}
            // Never offer a date in the future.
            disabled={isCurrentMonth && index + 1 > today.getDate()}
            onPress={() => onChange({ year, month, day: index + 1 })}
            testID={`watch-date-day-${index + 1}`}
          />
        ))}
      </View>
    </View>
  );
}

/** Keeps the day inside the month and the date out of the future. */
export function clampDate({ year, month, day }: PickedDate): PickedDate {
  const today = new Date();
  const safeMonth = year === today.getFullYear() ? Math.min(month, today.getMonth()) : month;
  const lastDay =
    year === today.getFullYear() && safeMonth === today.getMonth()
      ? today.getDate()
      : daysInMonth(year, safeMonth);

  return { year, month: safeMonth, day: Math.min(day, lastDay) };
}

export function YearPicker({
  value,
  page,
  onPageChange,
  onSelect,
}: {
  value: number | null;
  /** 0 is the newest block of years. */
  page: number;
  onPageChange: (page: number) => void;
  onSelect: (year: number) => void;
}) {
  const newest = new Date().getFullYear() - page * YEARS_PER_PAGE;
  const years = Array.from({ length: YEARS_PER_PAGE }, (_, index) => newest - index)
    .filter((year) => year >= MIN_WATCH_YEAR);

  return (
    <View>
      <Header
        title={`${years[years.length - 1]} – ${years[0]}`}
        onPrevious={
          years[years.length - 1]! > MIN_WATCH_YEAR ? () => onPageChange(page + 1) : undefined
        }
        onNext={page > 0 ? () => onPageChange(page - 1) : undefined}
      />
      <View style={styles.grid}>
        {years.map((year) => (
          <Cell
            key={year}
            width="25%"
            label={String(year)}
            selected={year === value}
            onPress={() => onSelect(year)}
            testID={`watch-date-year-${year}`}
          />
        ))}
      </View>
    </View>
  );
}

export function MonthPicker({
  year,
  value,
  onSelect,
}: {
  year: number;
  value: number;
  onSelect: (month: number) => void;
}) {
  const today = new Date();
  const monthName = new Intl.DateTimeFormat(getUiFormatLocaleTag(), { month: 'short' });

  return (
    <View>
      <Header title={String(year)} />
      <View style={styles.grid}>
        {Array.from({ length: 12 }, (_, month) => (
          <Cell
            key={month}
            width="25%"
            label={monthName.format(new Date(2000, month, 1))}
            selected={month === value}
            disabled={year === today.getFullYear() && month > today.getMonth()}
            onPress={() => onSelect(month)}
            testID={`watch-date-month-${month + 1}`}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  arrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  title: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  titleLabel: { color: premiumSheet.textPrimary, fontWeight: '700', textTransform: 'capitalize' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  weekday: { width: '14.28%', alignItems: 'center', paddingVertical: spacing.xs },
  cellSlot: { alignItems: 'center', paddingVertical: 2 },
  cell: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  cellSelected: {
    borderColor: premiumSheet.goldBorder,
    backgroundColor: premiumSheet.elevated,
  },
  cellDisabled: { opacity: 0.3 },
  label: { color: premiumSheet.textPrimary },
  muted: { color: premiumSheet.textSecondary },
});
