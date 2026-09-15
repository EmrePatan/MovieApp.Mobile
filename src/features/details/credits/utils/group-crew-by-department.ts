import type { CrewMember } from '../types';

export const CREW_DEPARTMENT_ORDER = [
  'Directing',
  'Creator',
  'Writing',
  'Production',
  'Camera',
  'Sound',
  'Editing',
  'Art',
  'Costume & Make-Up',
  'Visual Effects',
  'Crew',
  'Other',
] as const;

export type CrewDepartmentGroup = {
  title: string;
  data: CrewMember[];
};

function resolveDepartmentSectionTitle(department: string | null | undefined): string {
  const normalized = department?.trim();
  if (!normalized) {
    return 'Other';
  }

  const match = CREW_DEPARTMENT_ORDER.find(
    (entry) => entry.toLowerCase() === normalized.toLowerCase(),
  );

  return match ?? 'Other';
}

export function groupCrewByDepartment(crew: CrewMember[]): CrewDepartmentGroup[] {
  const grouped = new Map<string, CrewMember[]>();

  for (const member of crew) {
    const sectionTitle = resolveDepartmentSectionTitle(member.department);
    const existing = grouped.get(sectionTitle);
    if (existing) {
      existing.push(member);
      continue;
    }

    grouped.set(sectionTitle, [member]);
  }

  return CREW_DEPARTMENT_ORDER
    .filter((title) => grouped.has(title))
    .map((title) => ({
      title,
      data: grouped.get(title) ?? [],
    }));
}
