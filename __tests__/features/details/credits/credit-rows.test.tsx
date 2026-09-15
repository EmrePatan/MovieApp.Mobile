import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { CreditCastRow } from '@/features/details/credits/components/CreditCastRow';
import { CreditCrewRow } from '@/features/details/credits/components/CreditCrewRow';

describe('credit rows', () => {
  it('renders movie cast character and navigates when pressable', () => {
    const onPress = jest.fn();

    render(
      <CreditCastRow
        contentType="movie"
        member={{
          providerPersonId: 10,
          name: 'Matthew McConaughey',
          character: 'Cooper',
          roles: null,
          totalEpisodeCount: null,
          profileImagePath: null,
          order: 0,
        }}
        onPress={onPress}
      />,
    );

    expect(screen.getByText('Cooper')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('View Matthew McConaughey'));
    expect(onPress).toHaveBeenCalled();
  });

  it('renders tv multiple roles and episode count', () => {
    render(
      <CreditCastRow
        contentType="tv"
        member={{
          providerPersonId: 11,
          name: 'Bryan Cranston',
          character: null,
          roles: [
            { character: 'Walter White', episodeCount: 62 },
            { character: 'Heisenberg', episodeCount: 40 },
          ],
          totalEpisodeCount: 62,
          profileImagePath: null,
          order: 0,
        }}
      />,
    );

    expect(screen.getByText('Walter White · Multiple roles')).toBeTruthy();
    expect(screen.getByText('62 episodes')).toBeTruthy();
  });

  it('does not navigate crew rows without providerPersonId', () => {
    const onPress = jest.fn();

    render(
      <CreditCrewRow
        member={{
          providerPersonId: null,
          name: 'Unknown Crew',
          job: 'Grip',
          department: 'Crew',
          profileImagePath: null,
        }}
        onPress={onPress}
      />,
    );

    fireEvent.press(screen.getByText('Unknown Crew'));
    expect(onPress).not.toHaveBeenCalled();
  });
});
