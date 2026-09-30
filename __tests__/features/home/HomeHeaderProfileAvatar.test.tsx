import { render } from '@testing-library/react-native';
import { Image } from 'react-native';
import { HomeHeaderProfileAvatar } from '@/features/home/components/HomeHeaderProfileAvatar';

jest.mock('@/auth/useAuth', () => ({
  useAuth: () => ({
    user: {
      displayName: 'Emre Cave',
      effectiveAvatarUrl: 'https://cdn.example.com/header.webp',
    },
  }),
}));

describe('HomeHeaderProfileAvatar', () => {
  it('passes auth effectiveAvatarUrl to UserAvatar', () => {
    const screen = render(<HomeHeaderProfileAvatar onPress={jest.fn()} />);
    const image = screen.UNSAFE_getByType(Image);
    expect(image.props.source).toEqual({ uri: 'https://cdn.example.com/header.webp' });
  });
});
