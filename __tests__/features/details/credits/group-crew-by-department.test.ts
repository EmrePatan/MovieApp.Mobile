import { groupCrewByDepartment } from '@/features/details/credits/utils/group-crew-by-department';
import type { CrewMember } from '@/features/details/credits/types';

function crewMember(overrides: Partial<CrewMember>): CrewMember {
  return {
    providerPersonId: 1,
    name: 'Person',
    job: 'Job',
    department: 'Crew',
    profileImagePath: null,
    ...overrides,
  };
}

describe('groupCrewByDepartment', () => {
  it('groups crew by department in mobile order', () => {
    const grouped = groupCrewByDepartment([
      crewMember({ name: 'Writer', department: 'Writing' }),
      crewMember({ name: 'Director', department: 'Directing' }),
      crewMember({ name: 'Producer', department: 'Production' }),
    ]);

    expect(grouped.map((section) => section.title)).toEqual([
      'Directing',
      'Writing',
      'Production',
    ]);
    expect(grouped[0]?.data[0]?.name).toBe('Director');
  });

  it('maps unknown departments to Other', () => {
    const grouped = groupCrewByDepartment([
      crewMember({ name: 'Mystery', department: 'Lighting' }),
      crewMember({ name: 'Blank', department: '' }),
    ]);

    expect(grouped).toEqual([
      {
        title: 'Other',
        data: [
          crewMember({ name: 'Mystery', department: 'Lighting' }),
          crewMember({ name: 'Blank', department: '' }),
        ],
      },
    ]);
  });
});
