import type { DetailExtras } from '@/features/details/shared/types/detail-extras';
import {
  buildDetailFacts,
  resolveCertification,
} from '@/features/details/shared/utils/detail-facts';

const extras: DetailExtras = {
  tagline: null,
  certifications: { TR: '13+', US: 'PG-13' },
  networks: ['HBO'],
  creators: [],
  productionCompanies: [],
  budget: null,
  revenue: 1000000,
  lastEpisode: { seasonNumber: 2, episodeNumber: 8, airDate: null },
};

describe('detail facts', () => {
  it('shows only the rating of the user region', () => {
    expect(resolveCertification(extras, 'tr')).toBe('13+');
    expect(resolveCertification(extras, 'DE')).toBeNull();
    expect(resolveCertification(null, 'TR')).toBeNull();
  });

  it('lists only the facts that have a value', () => {
    const facts = buildDetailFacts(extras);

    expect(facts.map((fact) => fact.wide)).toEqual([false, false, true]);
    expect(facts[0].value).toMatch(/^\$1(M| Mn)$/);
    expect(facts[1].value).toBe('HBO');
    expect(buildDetailFacts(undefined)).toEqual([]);
  });
});
