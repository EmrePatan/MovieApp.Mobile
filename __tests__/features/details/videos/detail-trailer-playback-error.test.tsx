import { Alert, Linking } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { DetailHeroTrailerLayer } from '@/features/details/videos/components/DetailHeroTrailerLayer';

jest.mock('expo-router', () => ({ useFocusEffect: jest.fn() }));

jest.mock('@/features/details/videos/hooks/useDetailTrailerWatchUrl', () => ({
  useDetailTrailerWatchUrl: () => ({ watchUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' }),
}));

jest.mock('@/features/details/videos/components/InlineYoutubeTrailerPlayer', () => ({
  InlineYoutubeTrailerPlayer: ({ onPlaybackError }: { onPlaybackError: (code: number) => void }) => {
    const React = require('react');
    const { Pressable: MockPressable } = require('react-native');
    return React.createElement(MockPressable, {
      testID: 'fail-playback',
      onPress: () => onPlaybackError(150),
    });
  },
}));

describe('detail trailer playback error', () => {
  it('stays in the app and opens YouTube only when asked', async () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    const openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true as never);
    jest.spyOn(Linking, 'canOpenURL').mockResolvedValue(true);
    render(<DetailHeroTrailerLayer contentType="movie" contentId="id" topOffset={0} />);

    fireEvent.press(screen.getByTestId('detail-trailer-play-affordance'));
    fireEvent.press(screen.getByTestId('fail-playback'));

    expect(openURL).not.toHaveBeenCalled();
    const buttons = alert.mock.calls[0][2]!;
    await act(async () => buttons[1].onPress?.());
    expect(openURL).toHaveBeenCalledWith('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  });
});
