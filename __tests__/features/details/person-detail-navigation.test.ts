import { openPersonDetail } from '@/features/details/shared/navigation/person-detail-navigation';

describe('person detail navigation', () => {
  it('pushes the person detail route onto the root stack', () => {
    const push = jest.fn();
    const router = { push } as never;

    openPersonDetail(router, 1001);

    expect(push).toHaveBeenCalledWith('/person/1001');
  });
});
