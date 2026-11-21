import { fireEvent, render, screen } from '@testing-library/react-native';
import { Linking } from 'react-native';
import { ProfileSocialLinksRow } from '@/features/profile/components/ProfileSocialLinksRow';

describe('ProfileSocialLinksRow', () => {
  it('renders nothing when links are empty', () => {
    const { toJSON } = render(<ProfileSocialLinksRow links={null} />);
    expect(toJSON()).toBeNull();
  });

  it('opens filled platform URLs', () => {
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined as never);

    render(
      <ProfileSocialLinksRow
        links={{
          instagram: 'emre',
          x: null,
        }}
      />,
    );

    fireEvent.press(screen.getByLabelText('Instagram: emre'));
    expect(openURL).toHaveBeenCalledWith('https://instagram.com/emre');
    openURL.mockRestore();
  });
});
