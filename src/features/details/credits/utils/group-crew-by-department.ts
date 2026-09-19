import { translateCrewDepartment } from '@/i18n/catalog-labels';
import type { CrewMember } from '../types';

const CREW_DEPARTMENT_KEYS = [
  'directing',
  'creator',
  'writing',
  'production',
  'camera',
  'sound',
  'editing',
  'art',
  'costume & make-up',
  'visual effects',
  'crew',
  'other',
] as const;

export type CrewDepartmentGroup = {
  title: string;
  data: CrewMember[];
};

function normalizeDepartmentKey(department: string | null | undefined): string {
  const normalized = department?.trim().toLowerCase();
  if (!normalized) {
    return 'other';
  }

  if (CREW_DEPARTMENT_KEYS.includes(normalized as (typeof CREW_DEPARTMENT_KEYS)[number])) {
    return normalized;
  }

  return 'other';
}

function resolveDepartmentSectionTitle(department: string | null | undefined): string {
  const translated = translateCrewDepartment(department);
  if (translated) {
    return translated;
  }

  const normalized = department?.trim();
  if (!normalized) {
    return translateCrewDepartment(null) ?? 'Other';
  }

  return normalized;
}

export function groupCrewByDepartment(crew: CrewMember[]): CrewDepartmentGroup[] {
  const grouped = new Map<string, CrewMember[]>();

  for (const member of crew) {
    const sectionKey = normalizeDepartmentKey(member.department);
    const existing = grouped.get(sectionKey);
    if (existing) {
      existing.push(member);
      continue;
    }

    grouped.set(sectionKey, [member]);
  }

  return CREW_DEPARTMENT_KEYS.filter((key) => grouped.has(key)).map((key) => ({
    title: resolveDepartmentSectionTitle(key === 'other' ? null : key),
    data: grouped.get(key) ?? [],
  }));
}
