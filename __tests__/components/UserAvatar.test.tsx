import { act, render } from '@testing-library/react-native';
import { Image } from 'react-native';
import { UserAvatar, getDisplayInitials } from '@/components/common/UserAvatar';

describe('UserAvatar', () => {
  it('renders initials when no effective avatar url', () => {
    const screen = render(
      <UserAvatar displayName="Emre Cave" effectiveAvatarUrl={null} size={40} />,
    );
    expect(screen.getByText('EC')).toBeTruthy();
  });

  it('falls back to initials when remote image load fails', () => {
    const screen = render(
      <UserAvatar
        displayName="Emre Cave"
        effectiveAvatarUrl="https://cdn.example.com/broken.webp"
        size={40}
      />,
    );
    act(() => {
      screen.UNSAFE_getByType(Image).props.onError?.();
    });
    act(() => {
      screen.UNSAFE_getByType(Image).props.onError?.();
    });
    expect(screen.getByText('EC')).toBeTruthy();
  });

  it('renders image when effective avatar url is provided', () => {
    const screen = render(
      <UserAvatar
        displayName="Emre Cave"
        effectiveAvatarUrl="https://cdn.example.com/avatar.webp"
        size={40}
      />,
    );
    expect(screen.UNSAFE_getByType(Image)).toBeTruthy();
  });

  it('getDisplayInitials handles empty names', () => {
    expect(getDisplayInitials('', 'MA')).toBe('MA');
  });
});
