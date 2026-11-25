import { memo, useMemo, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { AppText } from '@/components/common/AppText';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import type { InsightsV3DayActivity } from '../types';
import { formatMonthName } from '../utils/insights-format';

const CELL = 11;
const GAP = 3;
const STEP = CELL + GAP;
const ROWS = 7;
const LEVELS = [
  'rgba(255, 255, 255, 0.06)',
  'rgba(212, 179, 106, 0.30)',
  'rgba(212, 179, 106, 0.52)',
  'rgba(236, 210, 150, 0.78)',
  'rgba(246, 226, 176, 1)',
];

function levelFor(total: number) {
  if (total <= 0) return 0;
  if (total === 1) return 1;
  if (total === 2) return 2;
  if (total <= 4) return 3;
  return 4;
}

function isLeapYear(year: number) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

interface InsightsActivityHeatmapProps {
  year: number;
  days: InsightsV3DayActivity[];
}

/** GitHub-style year grid: one column per week (Monday first), brighter gold = more watches that day. */
export const InsightsActivityHeatmap = memo(function InsightsActivityHeatmap({
  year,
  days,
}: InsightsActivityHeatmapProps) {
  const { t } = useTranslation();
  const scrollRef = useRef<ScrollView>(null);

  const { columns, monthMarks, todayColumn } = useMemo(() => {
    const totals = new Map(days.map((day) => [day.dayOfYear, day.total]));
    const dayCount = isLeapYear(year) ? 366 : 365;
    const offset = (new Date(year, 0, 1).getDay() + 6) % 7;
    const weekCount = Math.ceil((dayCount + offset) / ROWS);
    const cols: { key: number; cells: (number | null)[] }[] = [];
    for (let week = 0; week < weekCount; week += 1) {
      const cells: (number | null)[] = [];
      for (let row = 0; row < ROWS; row += 1) {
        const dayOfYear = week * ROWS + row - offset + 1;
        cells.push(dayOfYear < 1 || dayOfYear > dayCount ? null : (totals.get(dayOfYear) ?? 0));
      }
      cols.push({ key: week, cells });
    }

    const marks: { column: number; month: number }[] = [];
    for (let month = 0; month < 12; month += 1) {
      const first = Math.floor((new Date(year, month, 1).getTime() - new Date(year, 0, 1).getTime()) / 86400000);
      marks.push({ column: Math.floor((first + offset) / ROWS), month: month + 1 });
    }

    const now = new Date();
    const today =
      now.getFullYear() === year
        ? Math.floor((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000)
        : weekCount - 1;
    return {
      columns: cols,
      monthMarks: marks,
      todayColumn: now.getFullYear() === year ? Math.floor((today + offset) / ROWS) : 0,
    };
  }, [days, year]);

  return (
    <View style={styles.wrap} testID="insights-activity-heatmap">
      <AppText variant="caption" style={styles.title}>
        {t('insights.yourYear.heatmapTitle')}
      </AppText>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={() => {
          // Open on the current week; past years start from January.
          scrollRef.current?.scrollTo({
            x: Math.max(0, todayColumn * STEP - 140),
            animated: false,
          });
        }}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <View>
          <View style={styles.monthRow}>
            {monthMarks.map((mark) => (
              <AppText
                key={mark.month}
                variant="caption"
                muted
                style={[styles.monthLabel, { left: mark.column * STEP }]}
              >
                {formatMonthName(mark.month)}
              </AppText>
            ))}
          </View>
          <View style={styles.grid}>
            {columns.map((column) => (
              <View key={column.key} style={styles.column}>
                {column.cells.map((total, row) => (
                  <View
                    key={row}
                    style={[
                      styles.cell,
                      total == null
                        ? styles.cellBlank
                        : { backgroundColor: LEVELS[levelFor(total)] },
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <View style={styles.legend}>
        <AppText variant="caption" muted>
          {t('insights.yourYear.heatmapLess')}
        </AppText>
        {LEVELS.map((color) => (
          <View key={color} style={[styles.cell, { backgroundColor: color }]} />
        ))}
        <AppText variant="caption" muted>
          {t('insights.yourYear.heatmapMore')}
        </AppText>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  title: {
    color: colors.accentStrong,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  monthRow: {
    height: 16,
    marginBottom: 4,
  },
  monthLabel: {
    position: 'absolute',
    top: 0,
    fontSize: 10,
  },
  grid: {
    flexDirection: 'row',
    gap: GAP,
  },
  column: {
    gap: GAP,
  },
  cell: {
    width: CELL,
    height: CELL,
    borderRadius: 3,
  },
  cellBlank: {
    backgroundColor: 'transparent',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
});
