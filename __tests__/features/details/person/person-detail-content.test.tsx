import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { PersonDetailContent } from '@/features/details/person/components/PersonDetailContent';

jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
  useSegments: jest.fn(() => ['(tabs)', 'person', '[tmdbId]']),
}));

describe('PersonDetailContent', () => {
  it('renders biography and filmography', () => {
    render(
      <PersonDetailContent
        person={{
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          tmdbId: 1001,
          name: 'Matthew McConaughey',
          profileImagePath: '/profile.jpg',
          biography: 'Award-winning actor.',
          birthday: '1969-11-04',
          deathday: null,
          placeOfBirth: 'Texas',
          knownForDepartment: 'Acting',
          filmography: [
            {
              mediaType: 'movie',
              catalogId: '7c9e6679-7425-40de-944b-e07fc1f90ae7',
              tmdbId: 900001,
              title: 'Interstellar',
              posterPath: '/poster.jpg',
              character: 'Cooper',
              releaseDate: '2014-11-07',
            },
          ],
        }}
      />,
    );

    expect(screen.getByText('Matthew McConaughey')).toBeTruthy();
    expect(screen.getByText('Award-winning actor.')).toBeTruthy();
    expect(screen.getByText('Interstellar')).toBeTruthy();
    expect(screen.getByTestId('person-filmography')).toBeTruthy();
  });

  it('shows biography empty state', () => {
    render(
      <PersonDetailContent
        person={{
          id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          tmdbId: 1001,
          name: 'Jane Actor',
          profileImagePath: null,
          biography: null,
          birthday: null,
          deathday: null,
          placeOfBirth: null,
          knownForDepartment: null,
          filmography: [],
        }}
      />,
    );

    expect(screen.getByTestId('person-biography-empty')).toBeTruthy();
    expect(screen.getByTestId('person-filmography-empty')).toBeTruthy();
  });
});
