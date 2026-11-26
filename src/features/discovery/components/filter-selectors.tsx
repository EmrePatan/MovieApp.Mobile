import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppInput } from '@/components/inputs/AppInput';
import { translateGenreName } from '@/i18n/catalog-labels';
import { CatalogChipRow, CatalogOptionList } from '@/features/catalog/components';
import {
  CATALOG_MIN_RATING_OPTIONS,
  CATALOG_RUNTIME_PRESETS,
  CATALOG_VOTE_COUNT_OPTIONS,
  CATALOG_YEAR_PRESETS,
  resolveCatalogRuntimePresetKey,
  resolveCatalogYearPresetKey,
  type CatalogRuntimePresetKey,
  type CatalogYearPresetKey,
} from '../catalog-filter-presets';
import { CATALOG_LANGUAGE_OPTIONS } from '../catalog-language-options';
import { countryCodeToFlagEmoji } from '../utils/country-flag';
import { getOriginCountryOptions } from '../world-cinema-collections';
import type { Genre } from '../types';
import { premiumSheet } from '@/theme/premium-sheet';
import { spacing } from '@/theme/spacing';

/**
 * Drill-down lists and row summaries shared by the catalog filter sheet and the
 * advanced discover filter sheet, so both look and behave the same.
 */

interface YearValue {
  year: number | null;
  yearFrom: number | null;
  yearTo: number | null;
}

interface RuntimeValue {
  minRuntimeMinutes: number | null;
  maxRuntimeMinutes: number | null;
}

export function flagEmojiForOriginCountry(code: string | null | undefined): string | undefined {
  if (!code) {
    return undefined;
  }

  const normalized = code.trim().toUpperCase();
  if (normalized.length !== 2) {
    return undefined;
  }

  const emoji = countryCodeToFlagEmoji(normalized);
  return emoji.length > 0 ? emoji : undefined;
}

export function formatFilterList(values: string[], fallback: string): string {
  if (values.length === 0) {
    return fallback;
  }

  if (values.length <= 2) {
    return values.join(', ');
  }

  return `${values.slice(0, 2).join(', ')} +${values.length - 2}`;
}

export function useFilterSummaries() {
  const { t } = useTranslation();
  const anyLabel = t('discovery.catalogFilters.any');

  return {
    anyLabel,
    year: (value: YearValue) => {
      if (value.year != null) {
        return String(value.year);
      }

      if (value.yearFrom != null || value.yearTo != null) {
        return `${value.yearFrom ?? '…'}–${value.yearTo ?? '…'}`;
      }

      return anyLabel;
    },
    rating: (rating: number | null) =>
      rating != null ? t('discovery.catalogFilters.ratingOption', { rating }) : anyLabel,
    language: (code: string | null) =>
      code
        ? t(`discovery.catalogFilters.languageNames.${code}`, { defaultValue: code })
        : anyLabel,
    country: (code: string | null) => {
      if (!code) {
        return anyLabel;
      }

      return getOriginCountryOptions().find((option) => option.code === code)?.label ?? code;
    },
    runtime: (value: RuntimeValue) => {
      const key = resolveCatalogRuntimePresetKey(value);
      if (key === 'any') {
        return anyLabel;
      }

      if (key === 'custom') {
        return `${value.minRuntimeMinutes ?? '…'}–${value.maxRuntimeMinutes ?? '…'}`;
      }

      return t(`discovery.advancedDiscover.runtimePresets.${key}`);
    },
    voteCount: (count: number | null) =>
      count != null ? t('discovery.catalogFilters.voteCountOption', { count }) : anyLabel,
  };
}

export function GenreFilterList({
  genres,
  isLoading,
  selectedIds,
  onChange,
}: {
  genres: Genre[];
  isLoading: boolean;
  selectedIds: string[];
  onChange: (genreIds: string[]) => void;
}) {
  return (
    <>
      {isLoading ? <ActivityIndicator color={premiumSheet.mutedGold} /> : null}
      <CatalogOptionList
        multi
        values={selectedIds}
        options={genres.map((genre) => ({
          value: genre.id,
          label: translateGenreName(genre.name),
        }))}
        onChange={onChange}
        testID="catalog-genre-selector"
      />
    </>
  );
}

export function RatingFilterList({
  value,
  ratings = CATALOG_MIN_RATING_OPTIONS,
  labelFor,
  onChange,
  onComplete,
}: {
  value: number | null;
  ratings?: readonly (number | null)[];
  /** Replaces the "7+" wording, e.g. for a maximum rating. */
  labelFor?: (rating: number) => string;
  onChange: (rating: number | null) => void;
  onComplete: () => void;
}) {
  const { t } = useTranslation();

  return (
    <CatalogOptionList
      values={[String(value ?? '')]}
      options={ratings.map((rating) => ({
        value: rating == null ? '' : String(rating),
        label:
          rating == null
            ? t('discovery.catalogFilters.any')
            : (labelFor?.(rating) ?? t('discovery.catalogFilters.ratingOption', { rating })),
      }))}
      onChange={(values) => {
        const raw = values[0];
        onChange(raw && raw.length > 0 ? Number.parseFloat(raw) : null);
      }}
      onSingleSelectComplete={onComplete}
    />
  );
}

export function LanguageFilterList({
  value,
  onChange,
  onComplete,
}: {
  value: string | null;
  onChange: (code: string | null) => void;
  onComplete: () => void;
}) {
  const { t } = useTranslation();

  return (
    <CatalogOptionList
      values={[value ?? '']}
      options={[
        { value: '', label: t('discovery.catalogFilters.any') },
        ...CATALOG_LANGUAGE_OPTIONS.map((option) => ({
          value: option.code,
          label: t(`discovery.catalogFilters.languageNames.${option.labelKey}`),
        })),
      ]}
      onChange={(values) => onChange(values[0] && values[0].length > 0 ? values[0] : null)}
      onSingleSelectComplete={onComplete}
    />
  );
}

export function CountryFilterList({
  value,
  defaultCountry,
  onChange,
  onComplete,
}: {
  value: string | null;
  /** A page with a fixed default country has no "Any" row. */
  defaultCountry?: string | null;
  onChange: (code: string | null) => void;
  onComplete: () => void;
}) {
  const { t } = useTranslation();

  return (
    <CatalogOptionList
      values={[value ?? defaultCountry ?? '']}
      options={[
        ...(defaultCountry ? [] : [{ value: '', label: t('discovery.catalogFilters.any') }]),
        ...getOriginCountryOptions().map((option) => ({
          value: option.code,
          label: option.label,
          flagEmoji: flagEmojiForOriginCountry(option.code),
        })),
      ]}
      onChange={(values) => {
        const next = values[0] && values[0].length > 0 ? values[0] : null;
        onChange(next ?? defaultCountry ?? null);
      }}
      onSingleSelectComplete={onComplete}
    />
  );
}

export function VoteCountFilterList({
  value,
  onChange,
  onComplete,
}: {
  value: number | null;
  onChange: (count: number | null) => void;
  onComplete: () => void;
}) {
  const { t } = useTranslation();

  return (
    <CatalogOptionList
      values={[String(value ?? '')]}
      options={CATALOG_VOTE_COUNT_OPTIONS.map((count) => ({
        value: count == null ? '' : String(count),
        label:
          count == null
            ? t('discovery.catalogFilters.any')
            : t('discovery.catalogFilters.voteCountOption', { count }),
      }))}
      onChange={(values) => {
        const raw = values[0];
        onChange(raw && raw.length > 0 ? Number.parseInt(raw, 10) : null);
      }}
      onSingleSelectComplete={onComplete}
    />
  );
}

/** Mounted each time the year list opens, so the chosen mode starts from the current value. */
export function YearFilterPanel({
  value,
  onChange,
}: {
  value: YearValue;
  onChange: (patch: Partial<YearValue>) => void;
}) {
  const { t } = useTranslation();
  const [customChosen, setCustomChosen] = useState(
    () => resolveCatalogYearPresetKey(value) === 'custom',
  );
  const resolved = resolveCatalogYearPresetKey(value);
  const mode: CatalogYearPresetKey = customChosen ? 'custom' : resolved;
  // A single exact year (from a link) shows as the same year at both ends.
  const from = value.yearFrom ?? value.year;
  const to = value.yearTo ?? value.year;

  const parseYear = (text: string) => {
    const trimmed = text.trim();
    return trimmed.length === 0 ? null : Number.parseInt(trimmed, 10) || null;
  };

  return (
    <>
      <CatalogChipRow
        options={[
          ...CATALOG_YEAR_PRESETS.map((preset) => ({
            value: preset.key,
            label:
              preset.key === 'any'
                ? t('discovery.catalogFilters.any')
                : t(`discovery.catalogFilters.yearPresets.${preset.key}`),
          })),
          {
            value: 'custom' as CatalogYearPresetKey,
            label: t('discovery.catalogFilters.customRange'),
          },
        ]}
        value={mode}
        onChange={(key) => {
          setCustomChosen(key === 'custom');
          if (key === 'custom') {
            onChange({ year: null, yearFrom: from, yearTo: to });
            return;
          }

          const preset = CATALOG_YEAR_PRESETS.find((item) => item.key === key);
          if (preset) {
            onChange({ year: preset.year, yearFrom: preset.yearFrom, yearTo: preset.yearTo });
          }
        }}
      />
      {mode === 'custom' ? (
        <View style={styles.rangeInputs}>
          <AppInput
            label={t('common.from')}
            value={from != null ? String(from) : ''}
            onChangeText={(text) => {
              setCustomChosen(true);
              onChange({ year: null, yearFrom: parseYear(text), yearTo: to });
            }}
            placeholder={t('common.placeholderYearFromExample')}
            keyboardType="number-pad"
            maxLength={4}
          />
          <AppInput
            label={t('common.to')}
            value={to != null ? String(to) : ''}
            onChangeText={(text) => {
              setCustomChosen(true);
              onChange({ year: null, yearFrom: from, yearTo: parseYear(text) });
            }}
            placeholder={t('common.placeholderYearToExample')}
            keyboardType="number-pad"
            maxLength={4}
          />
        </View>
      ) : null}
    </>
  );
}

export function RuntimeFilterPanel({
  value,
  onChange,
}: {
  value: RuntimeValue;
  onChange: (patch: RuntimeValue) => void;
}) {
  const { t } = useTranslation();
  const resolved = resolveCatalogRuntimePresetKey(value);

  return (
    <CatalogChipRow<CatalogRuntimePresetKey>
      options={CATALOG_RUNTIME_PRESETS.map((preset) => ({
        value: preset.key,
        label:
          preset.key === 'any'
            ? t('discovery.catalogFilters.any')
            : t(`discovery.advancedDiscover.runtimePresets.${preset.key}`),
      }))}
      value={resolved === 'custom' ? 'any' : resolved}
      onChange={(key) => {
        const preset = CATALOG_RUNTIME_PRESETS.find((item) => item.key === key);
        if (preset) {
          onChange({
            minRuntimeMinutes: preset.minRuntimeMinutes,
            maxRuntimeMinutes: preset.maxRuntimeMinutes,
          });
        }
      }}
    />
  );
}

const styles = StyleSheet.create({
  rangeInputs: {
    gap: spacing.sm,
  },
});
