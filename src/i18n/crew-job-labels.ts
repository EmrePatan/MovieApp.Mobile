import { i18n } from './index';

const CREW_JOB_ALIASES: Record<string, string> = {
  cinematographer: 'director_of_photography',
  director_of_photography: 'director_of_photography',
  original_music_composer: 'composer',
  music: 'composer',
  screenwriter: 'writer',
  author: 'writer',
  co_writer: 'writer',
  co_writer_: 'writer',
};

export function buildCrewJobKey(job: string): string {
  const normalized = job
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  return CREW_JOB_ALIASES[normalized] ?? normalized;
}

export function translateCrewJob(job: string | null | undefined): string {
  if (!job || job.trim().length === 0) {
    return '';
  }

  const trimmed = job.trim();
  const key = buildCrewJobKey(trimmed);
  const i18nKey = `details.crewJobs.${key}`;
  if (i18n.exists(i18nKey)) {
    return i18n.t(i18nKey);
  }

  return trimmed;
}
