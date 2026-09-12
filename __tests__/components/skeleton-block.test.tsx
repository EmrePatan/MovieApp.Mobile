import { render } from '@testing-library/react-native';
import { SkeletonBlock } from '@/components/loading/SkeletonBlock';

describe('SkeletonBlock', () => {
  it('renders with requested dimensions', () => {
    const { toJSON } = render(<SkeletonBlock width={72} height={108} />);
    expect(toJSON()).toMatchObject({
      props: {
        style: expect.arrayContaining([
          expect.objectContaining({ width: 72, height: 108 }),
        ]),
      },
    });
  });
});
