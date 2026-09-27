import { changeUiLanguage } from '@/i18n';
import { buildCrewJobKey, translateCrewJob } from '@/i18n/crew-job-labels';

describe('crew job labels', () => {
  it('normalizes TMDB job titles to stable keys', () => {
    expect(buildCrewJobKey('Executive Producer')).toBe('executive_producer');
    expect(buildCrewJobKey('Director of Photography')).toBe('director_of_photography');
    expect(buildCrewJobKey('Original Music Composer')).toBe('composer');
  });

  it('translates known jobs in Turkish', async () => {
    await changeUiLanguage('tr');
    expect(translateCrewJob('Executive Producer')).toBe('İcra Yapımcısı');
    expect(translateCrewJob('Director')).toBe('Yönetmen');
  });

  it('falls back to original job when unknown', async () => {
    await changeUiLanguage('tr');
    expect(translateCrewJob('Special Guest Star')).toBe('Special Guest Star');
  });

  it('keeps English labels in English UI', async () => {
    await changeUiLanguage('en');
    expect(translateCrewJob('Writer')).toBe('Writer');
  });
});
