import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { CreditsDetailContent } from '@/features/details/credits/components/CreditsDetailContent';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: mockPush,
    back: jest.fn(),
  }),
  useSegments: () => ['credits', 'movie', '3fa85f64-5717-4562-b3fc-2c963f66afa6'],
}));

describe('CreditsDetailContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders cast and crew tabs with title and grouped crew', () => {
    render(
      <CreditsDetailContent
        contentType="movie"
        title="Interstellar"
        credits={{
          cast: [
            {
              providerPersonId: 1,
              name: 'Matthew McConaughey',
              character: 'Cooper',
              roles: null,
              totalEpisodeCount: null,
              profileImagePath: null,
              order: 0,
            },
          ],
          crew: [
            {
              providerPersonId: 2,
              name: 'Christopher Nolan',
              job: 'Director',
              department: 'Directing',
              profileImagePath: null,
            },
            {
              providerPersonId: 3,
              name: 'Jonathan Nolan',
              job: 'Writer',
              department: 'Writing',
              profileImagePath: null,
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Cast & Crew')).toBeTruthy();
    expect(screen.getByText('Interstellar')).toBeTruthy();
    expect(screen.getByTestId('credits-cast-list')).toBeTruthy();
    expect(screen.getByText('Matthew McConaughey')).toBeTruthy();

    fireEvent.press(screen.getByTestId('credits-tab-crew'));
    expect(screen.getByTestId('credits-crew-list')).toBeTruthy();
    expect(screen.getByText('Directing')).toBeTruthy();
    expect(screen.getByText('Writing')).toBeTruthy();
    expect(screen.getByText('Christopher Nolan')).toBeTruthy();
  });

  it('navigates to person detail from cast row', () => {
    render(
      <CreditsDetailContent
        contentType="movie"
        credits={{
          cast: [
            {
              providerPersonId: 42,
              name: 'Matthew McConaughey',
              character: 'Cooper',
              roles: null,
              totalEpisodeCount: null,
              profileImagePath: null,
              order: 0,
            },
          ],
          crew: [],
        }}
      />,
    );

    fireEvent.press(screen.getByLabelText('View Matthew McConaughey'));
    expect(mockPush).toHaveBeenCalledWith('/person/42');
  });
});
