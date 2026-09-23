import {
  normalizeContentLocale,
  resolveContentLocaleFromUiLanguage,
  shouldShowReviewTranslationAction,
} from '@/features/reviews/utils/review-locale';

describe('review-locale', () => {
  it('normalizes supported content locales', () => {
    expect(normalizeContentLocale('tr')).toBe('tr-TR');
    expect(normalizeContentLocale('pt-BR')).toBe('pt-BR');
    expect(normalizeContentLocale(null)).toBeNull();
  });

  it('resolves ui language through the supported locale registry', () => {
    expect(resolveContentLocaleFromUiLanguage('de')).toBe('de-DE');
    expect(resolveContentLocaleFromUiLanguage('pt')).toBe('pt-BR');
  });

  it('shows translation when authoring locale differs from current locale', () => {
    expect(shouldShowReviewTranslationAction('es-ES', 'tr-TR')).toBe(true);
    expect(shouldShowReviewTranslationAction('tr', 'tr-TR')).toBe(false);
  });

  it('shows translation for legacy null authoring locale', () => {
    expect(shouldShowReviewTranslationAction(null, 'en-US')).toBe(true);
  });
});
